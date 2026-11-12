package space.inne.hazelwood.auth;

import io.papermc.paper.event.player.AsyncChatEvent;
import io.papermc.paper.connection.PlayerGameConnection;
import io.papermc.paper.dialog.Dialog;
import io.papermc.paper.dialog.DialogResponseView;
import io.papermc.paper.event.player.PlayerCustomClickEvent;
import io.papermc.paper.registry.data.dialog.ActionButton;
import io.papermc.paper.registry.data.dialog.DialogBase;
import io.papermc.paper.registry.data.dialog.action.DialogAction;
import io.papermc.paper.registry.data.dialog.body.DialogBody;
import io.papermc.paper.registry.data.dialog.input.DialogInput;
import io.papermc.paper.registry.data.dialog.type.DialogType;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import net.kyori.adventure.key.Key;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.event.ClickEvent;
import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.ConsoleCommandSender;
import org.bukkit.command.RemoteConsoleCommandSender;
import org.bukkit.entity.Entity;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.block.BlockBreakEvent;
import org.bukkit.event.block.BlockPlaceEvent;
import org.bukkit.event.entity.EntityDamageByEntityEvent;
import org.bukkit.event.entity.EntityDamageEvent;
import org.bukkit.event.entity.EntityPickupItemEvent;
import org.bukkit.event.inventory.InventoryClickEvent;
import org.bukkit.event.inventory.InventoryDragEvent;
import org.bukkit.event.inventory.InventoryOpenEvent;
import org.bukkit.event.player.AsyncPlayerPreLoginEvent;
import org.bukkit.event.player.PlayerCommandPreprocessEvent;
import org.bukkit.event.player.PlayerCommandSendEvent;
import org.bukkit.event.player.PlayerDropItemEvent;
import org.bukkit.event.player.PlayerInteractEntityEvent;
import org.bukkit.event.player.PlayerInteractEvent;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerMoveEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import org.bukkit.event.player.PlayerSwapHandItemsEvent;
import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.potion.PotionEffectType;

public final class HazelwoodAuth extends JavaPlugin implements Listener, CommandExecutor {
    private static final String DEFAULT_PORTAL_ORIGIN = "https://hazelwood-card.inne.space";
    private static final String REGISTER_URL = DEFAULT_PORTAL_ORIGIN + "/register";
    private static final String DEFAULT_AUTH_URL = "http://hazelwood-card:8080/internal/minecraft/auth";
    private static final String DEFAULT_SECRET_FILE = "/run/secrets/minecraft_auth_secret";
    private static final Set<String> PLAYER_PRESENTS_COMMANDS = Set.of("present", "gift", "gp");
    private static final int MAX_PASSWORD_BYTES = 1024;
    private static final int MAX_ATTEMPTS = 5;
    private static final Key LOGIN_DIALOG_ACTION = Key.key("hazelwood:login");
    private static final Set<String> BLOCKED_SKIN_COMMANDS = Set.of("skin", "skins", "sr", "skinsrestorer");
    private static final long FAILURE_WINDOW_MS = Duration.ofMinutes(10).toMillis();
    private static final long LOCKOUT_MS = Duration.ofMinutes(1).toMillis();
    private static final Pattern BOOLEAN_FIELD = Pattern.compile("\\\"([A-Za-z]+)\\\"\\s*:\\s*(true|false)");

    private final ConcurrentMap<UUID, Boolean> authenticated = new ConcurrentHashMap<>();
    private final ConcurrentMap<UUID, Boolean> inFlight = new ConcurrentHashMap<>();
    private final ConcurrentMap<UUID, Integer> attemptsBySession = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, FailureState> failuresByUsername = new ConcurrentHashMap<>();

    private HttpClient httpClient;
    private URI authUri;
    private String authSecret;
    private ProfileStore profileStore;
    private SkinRequestService skinRequestService;
    private MusicDiscRequestService musicDiscRequestService;
    private SeasonalIconService seasonalIconService;
    private SeasonalGiftPermissionService seasonalGiftPermissionService;
    private int profileTaskId = -1;

    @Override
    public void onEnable() {
        try {
            authUri = URI.create(System.getenv().getOrDefault("MINECRAFT_AUTH_URL", DEFAULT_AUTH_URL));
            if (!"http".equalsIgnoreCase(authUri.getScheme()) && !"https".equalsIgnoreCase(authUri.getScheme())) {
                throw new IOException("MINECRAFT_AUTH_URL must use HTTP or HTTPS");
            }
            if (authUri.getHost() == null || authUri.getUserInfo() != null || authUri.getQuery() != null || authUri.getFragment() != null) {
                throw new IOException("MINECRAFT_AUTH_URL must be an absolute URL without credentials or query parameters");
            }
            String secretFile = System.getenv().getOrDefault("MINECRAFT_AUTH_SECRET_FILE", DEFAULT_SECRET_FILE);
            authSecret = Files.readString(Path.of(secretFile), StandardCharsets.UTF_8).trim();
            if (authSecret.length() < 32) {
                throw new IOException("Minecraft auth secret must contain at least 32 characters");
            }
        } catch (Exception error) {
            getLogger().severe("Minecraft website authentication could not be configured; stopping the server to keep it closed.");
            Bukkit.shutdown();
            return;
        }

        httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(2))
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();

        Bukkit.getPluginManager().registerEvents(this, this);
        Bukkit.getPluginManager().registerEvents(new SeasonalMotdListener(), this);
        getLogger().info("Seasonal server-list MOTD is enabled.");
        Bukkit.getPluginCommand("login").setExecutor(this);
        Bukkit.getPluginCommand("register").setExecutor(this);
        Bukkit.getPluginCommand("hwskin").setExecutor(this);
        Bukkit.getPluginCommand("hwdisc").setExecutor(this);
        if (Bukkit.getPluginManager().isPluginEnabled("LuckPerms")) {
            try {
                seasonalGiftPermissionService = new SeasonalGiftPermissionService(this);
                seasonalGiftPermissionService.start();
            } catch (LinkageError | RuntimeException error) {
                seasonalGiftPermissionService = null;
                getLogger().warning("LuckPerms seasonal gift permission integration is unavailable ("
                        + error.getClass().getSimpleName() + "); command fallback will enforce the date window.");
            }
        } else {
            getLogger().warning("LuckPerms is unavailable; command fallback will enforce the PlayerPresents date window.");
        }
        try {
            URI portalOrigin = URI.create(System.getenv().getOrDefault(
                    "HAZELWOOD_PORTAL_ORIGIN", DEFAULT_PORTAL_ORIGIN));
            seasonalIconService = new SeasonalIconService(this, portalOrigin);
            seasonalIconService.start();
        } catch (Exception error) {
            getLogger().warning("Seasonal server icon integration is unavailable (" + error.getClass().getSimpleName() + ").");
        }
        musicDiscRequestService = new MusicDiscRequestService(this, httpClient, authSecret, authUri, this::isAuthenticated);
        try {
            profileStore = new ProfileStore(this);
            Bukkit.getPluginManager().registerEvents(profileStore, this);
            profileStore.exportAdvancementCatalog();
            profileTaskId = Bukkit.getScheduler().runTaskTimer(this, profileStore::tickSessions, 20L, 20L).getTaskId();
        } catch (IOException error) {
            getLogger().warning("Portal profile export is unavailable (" + error.getClass().getSimpleName() + ").");
        }
        if (profileStore != null && Bukkit.getPluginManager().isPluginEnabled("SkinsRestorer")) {
            try {
                skinRequestService = new SkinRequestService(this, profileStore, httpClient, authSecret, authUri);
                skinRequestService.exportExistingSkins();
            } catch (Exception error) {
                getLogger().warning("SkinsRestorer integration is unavailable (" + error.getClass().getSimpleName() + ").");
            }
        }
        getLogger().info("Website-based player authentication is enabled.");
    }

    @Override
    public void onDisable() {
        if (seasonalGiftPermissionService != null) {
            seasonalGiftPermissionService.stop();
        }
        clearPluginVisibility();
        if (profileTaskId >= 0) {
            Bukkit.getScheduler().cancelTask(profileTaskId);
        }
        if (profileStore != null) {
            profileStore.flushAndStop();
        }
        authenticated.clear();
        inFlight.clear();
        attemptsBySession.clear();
    }

    private void clearPluginVisibility() {
        for (Player viewer : Bukkit.getOnlinePlayers()) {
            for (Player target : Bukkit.getOnlinePlayers()) {
                if (!viewer.getUniqueId().equals(target.getUniqueId())) {
                    viewer.showPlayer(this, target);
                }
            }
        }
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onAsyncPreLogin(AsyncPlayerPreLoginEvent event) {
        if (event.getLoginResult() != AsyncPlayerPreLoginEvent.Result.ALLOWED) {
            return;
        }
        try {
            AuthResult account = checkAccount(event.getName(), null);
            if (account.banned()) {
                event.disallow(AsyncPlayerPreLoginEvent.Result.KICK_BANNED, Component.text("Доступ к серверу закрыт для этой учётной записи."));
            } else if (!account.registered()) {
                event.disallow(AsyncPlayerPreLoginEvent.Result.KICK_OTHER, registrationMessage());
            }
        } catch (Exception error) {
            getLogger().warning("Could not verify a Minecraft account before login (" + error.getClass().getSimpleName() + ").");
            event.disallow(AsyncPlayerPreLoginEvent.Result.KICK_OTHER, Component.text("Не удалось проверить аккаунт. Попробуйте зайти позже."));
        }
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();
        UUID id = player.getUniqueId();
        authenticated.remove(id);
        inFlight.remove(id);
        attemptsBySession.remove(id);
        synchronizeVisibility(player);
        player.sendMessage(Component.text("Введи пароль сайта в форме входа. Чтобы открыть её снова, используй /login."));
        Bukkit.getScheduler().runTaskLater(this, () -> {
            Player online = Bukkit.getPlayer(id);
            if (online != null && !authenticated.containsKey(id)) {
                showLoginDialog(online);
            }
        }, 1L);
        Bukkit.getScheduler().runTaskLater(this, () -> {
            Player online = Bukkit.getPlayer(id);
            if (online != null && !authenticated.containsKey(id)) {
                online.kick(Component.text("Время входа истекло. Используй /login, чтобы открыть форму."));
            }
        }, 20L * 90L);
    }

    private void synchronizeVisibility(Player player) {
        boolean playerAuthenticated = isAuthenticated(player);
        for (Player other : Bukkit.getOnlinePlayers()) {
            if (other.getUniqueId().equals(player.getUniqueId())) {
                continue;
            }

            if (playerAuthenticated) {
                other.showPlayer(this, player);
            } else {
                other.hidePlayer(this, player);
            }

            if (isAuthenticated(other)) {
                player.showPlayer(this, other);
            } else {
                player.hidePlayer(this, other);
            }
        }
    }

    private static boolean isPlayerPresentsCreateCommand(String message) {
        String[] arguments = message.trim().split("\\s+");
        if (arguments.length < 2 || !"create".equalsIgnoreCase(arguments[1])) {
            return false;
        }

        String label = arguments[0].startsWith("/") ? arguments[0].substring(1) : arguments[0];
        int namespaceSeparator = label.lastIndexOf(':');
        if (namespaceSeparator >= 0) {
            label = label.substring(namespaceSeparator + 1);
        }
        return PLAYER_PRESENTS_COMMANDS.contains(label.toLowerCase(Locale.ROOT));
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onCommand(PlayerCommandPreprocessEvent event) {
        Player player = event.getPlayer();
        String raw = event.getMessage();
        String commandLine = raw.startsWith("/") ? raw.substring(1) : raw;
        int separator = commandLine.indexOf(' ');
        String label = separator < 0 ? commandLine : commandLine.substring(0, separator);
        String command = unqualifiedCommand(label);

        if (BLOCKED_SKIN_COMMANDS.contains(command)) {
            event.setCancelled(true);
            player.sendMessage(Component.text("Сменить скин можно только на сайте Hazelwood."));
            return;
        }

        if (command.equals("register") || command.equals("reg")) {
            event.setCancelled(true);
            player.sendMessage(Component.text("Регистрация доступна только на сайте: ").append(registrationLink()));
            return;
        }

        if (!isAuthenticated(player)) {
            event.setCancelled(true);
            if (command.equals("login") || command.equals("l")) {
                if (separator >= 0) {
                    player.sendMessage(Component.text("Не вводи пароль в команде. Используй /login, чтобы открыть форму."));
                    return;
                }
                showLoginDialog(player);
            } else {
                player.sendMessage(Component.text("Сначала войди: используй /login, чтобы открыть форму."));
            }
            return;
        }

        if ((seasonalGiftPermissionService == null
                || !seasonalGiftPermissionService.isReady()
                || !Bukkit.getPluginManager().isPluginEnabled("LuckPerms"))
                && !SeasonalGiftWindow.allows(Instant.now())
                && isPlayerPresentsCreateCommand(raw)) {
            event.setCancelled(true);
            player.sendMessage(Component.text(
                    "Подарки можно создавать только с 1 декабря по 7 января (время Москвы)."));
        }
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onCommandSend(PlayerCommandSendEvent event) {
        event.getCommands().removeIf(command -> BLOCKED_SKIN_COMMANDS.contains(unqualifiedCommand(command)));
    }

    @EventHandler
    public void onLoginDialogSubmit(PlayerCustomClickEvent event) {
        if (!LOGIN_DIALOG_ACTION.equals(event.getIdentifier())) {
            return;
        }
        if (!(event.getCommonConnection() instanceof PlayerGameConnection connection)) {
            return;
        }
        DialogResponseView response = event.getDialogResponseView();
        if (response == null) {
            return;
        }
        String password = response.getText("password");
        login(connection.getPlayer(), password == null ? "" : password);
    }

    private void showLoginDialog(Player player) {
        Dialog dialog = Dialog.create(builder -> builder.empty()
                .base(DialogBase.builder(Component.text("Вход в Hazelwood"))
                        .body(List.of(DialogBody.plainMessage(
                                Component.text("Введи пароль учётной записи Hazelwood."))))
                        .inputs(List.of(DialogInput.text("password", Component.text("Пароль"))
                                .maxLength(MAX_PASSWORD_BYTES)
                                .width(300)
                                .build()))
                        .build())
                .type(DialogType.confirmation(
                        ActionButton.builder(Component.text("Войти"))
                                .action(DialogAction.customClick(LOGIN_DIALOG_ACTION, null))
                                .build(),
                        ActionButton.builder(Component.text("Отмена"))
                                .build())));
        player.showDialog(dialog);
    }

    private static String unqualifiedCommand(String label) {
        return label.substring(label.lastIndexOf(':') + 1).toLowerCase(Locale.ROOT);
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (command.getName().equalsIgnoreCase("hwdisc")) {
            if (!(sender instanceof ConsoleCommandSender) && !(sender instanceof RemoteConsoleCommandSender)) {
                sender.sendMessage("Эта команда доступна только из консоли.");
                return true;
            }
            if (args.length != 1 || musicDiscRequestService == null || !musicDiscRequestService.request(args[0])) {
                sender.sendMessage("Не удалось принять запрос на музыкальный диск.");
                return true;
            }
            sender.sendMessage("Запрос на музыкальный диск принят.");
            return true;
        }
        if (command.getName().equalsIgnoreCase("hwskin")) {
            if (!(sender instanceof ConsoleCommandSender) && !(sender instanceof RemoteConsoleCommandSender)) {
                sender.sendMessage("Эта команда доступна только из консоли.");
                return true;
            }
            if (args.length != 1 || skinRequestService == null || !skinRequestService.request(args[0])) {
                sender.sendMessage("Не удалось принять запрос на смену скина.");
                return true;
            }
            sender.sendMessage("Запрос на смену скина принят.");
            return true;
        }
        if (!(sender instanceof Player player)) {
            sender.sendMessage("Эта команда доступна только игроку.");
            return true;
        }
        if (command.getName().equalsIgnoreCase("register") || command.getName().equalsIgnoreCase("reg")) {
            player.sendMessage(Component.text("Регистрация доступна только на сайте: ").append(registrationLink()));
            return true;
        }
        if (command.getName().equalsIgnoreCase("login")) {
            if (args.length > 0) {
                player.sendMessage(Component.text("Не вводи пароль в команде. Используй /login, чтобы открыть форму."));
                return true;
            }
            if (isAuthenticated(player)) {
                player.sendMessage(Component.text("Ты уже вошёл в Hazelwood."));
            } else {
                showLoginDialog(player);
            }
            return true;
        }
        if (isAuthenticated(player)) {
            player.sendMessage(Component.text("Ты уже вошёл в Hazelwood."));
            return true;
        }
        player.sendMessage(Component.text("Неизвестная команда."));
        return true;
    }

    private void login(Player player, String password) {
        if (isAuthenticated(player)) {
            player.sendMessage(Component.text("Ты уже вошёл в Hazelwood."));
            return;
        }
        if (password.isEmpty()) {
            player.sendMessage(Component.text("Введи пароль в форме входа."));
            showLoginDialog(player);
            return;
        }
        if (password.getBytes(StandardCharsets.UTF_8).length > MAX_PASSWORD_BYTES) {
            player.sendMessage(Component.text("Пароль слишком длинный."));
            showLoginDialog(player);
            return;
        }
        UUID id = player.getUniqueId();
        String usernameKey = player.getName().toLowerCase(Locale.ROOT);
        long now = System.currentTimeMillis();
        FailureState failureState = failuresByUsername.get(usernameKey);
        if (failureState != null && failureState.windowEnd() < now) {
            failuresByUsername.remove(usernameKey, failureState);
            failureState = null;
        }
        if (failureState != null && failureState.lockedUntil() > now) {
            player.kick(Component.text("Слишком много попыток входа. Попробуй позже."));
            return;
        }
        if (inFlight.putIfAbsent(id, Boolean.TRUE) != null) {
            player.sendMessage(Component.text("Проверяю пароль…"));
            return;
        }

        String username = player.getName();
        Bukkit.getScheduler().runTaskAsynchronously(this, () -> {
            AuthResult result = null;
            Exception failure = null;
            try {
                result = checkAccount(username, password);
            } catch (Exception error) {
                failure = error;
            }
            AuthResult checked = result;
            Exception requestFailure = failure;
            Bukkit.getScheduler().runTask(this, () -> finishLogin(player, usernameKey, id, checked, requestFailure));
        });
    }

    private void finishLogin(Player player, String usernameKey, UUID id, AuthResult result, Exception requestFailure) {
        inFlight.remove(id);
        if (!player.isOnline() || authenticated.containsKey(id)) {
            return;
        }
        if (requestFailure != null) {
            getLogger().warning("Minecraft password check failed (" + requestFailure.getClass().getSimpleName() + ").");
            player.sendMessage(Component.text("Проверка временно недоступна. Попробуй снова."));
            showLoginDialog(player);
            return;
        }
        if (result.banned()) {
            player.kick(Component.text("Доступ к серверу закрыт для этой учётной записи."));
            return;
        }
        if (!result.registered()) {
            player.kick(registrationMessage());
            return;
        }
        if (Boolean.TRUE.equals(result.passwordValid())) {
            authenticated.put(id, Boolean.TRUE);
            synchronizeVisibility(player);
            player.removePotionEffect(PotionEffectType.BLINDNESS);
            player.removePotionEffect(PotionEffectType.DARKNESS);
            if (player.getWalkSpeed() == 0.0f) {
                player.setWalkSpeed(0.2f);
            }
            attemptsBySession.remove(id);
            failuresByUsername.remove(usernameKey);
            if (profileStore != null) {
                profileStore.beginSession(player);
            }
            if (skinRequestService != null) {
                skinRequestService.applyAccountSkinOrExportSelection(player);
            }
            if (musicDiscRequestService != null) {
                musicDiscRequestService.fetchPendingFor(player);
            }
            player.sendMessage(Component.text("Вход выполнен. Добро пожаловать в Hazelwood."));
            return;
        }

        int failedAttempts = attemptsBySession.merge(id, 1, Integer::sum);
        long now = System.currentTimeMillis();
        FailureState previous = failuresByUsername.get(usernameKey);
        int accountFailures = previous == null || previous.windowEnd() < now ? 1 : previous.failures() + 1;
        long windowEnd = previous == null || previous.windowEnd() < now ? now + FAILURE_WINDOW_MS : previous.windowEnd();
        long lockedUntil = accountFailures >= MAX_ATTEMPTS ? now + LOCKOUT_MS : 0;
        failuresByUsername.put(usernameKey, new FailureState(accountFailures, windowEnd, lockedUntil));
        if (failedAttempts >= MAX_ATTEMPTS || lockedUntil > now) {
            player.kick(Component.text("Слишком много неверных паролей. Попробуй снова через минуту."));
        } else {
            player.sendMessage(Component.text("Неверный пароль сайта. Попыток осталось: " + (MAX_ATTEMPTS - failedAttempts) + "."));
            showLoginDialog(player);
        }
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onMove(PlayerMoveEvent event) {
        if (isAuthenticated(event.getPlayer()) || event.getTo() == null) {
            return;
        }
        if (event.getFrom().getBlockX() != event.getTo().getBlockX()
                || event.getFrom().getBlockY() != event.getTo().getBlockY()
                || event.getFrom().getBlockZ() != event.getTo().getBlockZ()) {
            event.setCancelled(true);
        }
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onChat(AsyncChatEvent event) {
        if (!isAuthenticated(event.getPlayer())) {
            event.setCancelled(true);
        }
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onInteract(PlayerInteractEvent event) {
        if (!isAuthenticated(event.getPlayer())) {
            event.setCancelled(true);
        }
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onInteractEntity(PlayerInteractEntityEvent event) {
        if (!isAuthenticated(event.getPlayer())) {
            event.setCancelled(true);
        }
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onBreak(BlockBreakEvent event) {
        if (!isAuthenticated(event.getPlayer())) {
            event.setCancelled(true);
        }
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onPlace(BlockPlaceEvent event) {
        if (!isAuthenticated(event.getPlayer())) {
            event.setCancelled(true);
        }
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onDrop(PlayerDropItemEvent event) {
        if (!isAuthenticated(event.getPlayer())) {
            event.setCancelled(true);
        }
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onPickup(EntityPickupItemEvent event) {
        if (event.getEntity() instanceof Player player && !isAuthenticated(player)) {
            event.setCancelled(true);
        }
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onDamage(EntityDamageEvent event) {
        if (event.getEntity() instanceof Player player && !isAuthenticated(player)) {
            event.setCancelled(true);
        }
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onAttack(EntityDamageByEntityEvent event) {
        Entity damager = event.getDamager();
        if (damager instanceof Player player && !isAuthenticated(player)) {
            event.setCancelled(true);
        }
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onInventoryClick(InventoryClickEvent event) {
        if (event.getWhoClicked() instanceof Player player && !isAuthenticated(player)) {
            event.setCancelled(true);
        }
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onInventoryDrag(InventoryDragEvent event) {
        if (event.getWhoClicked() instanceof Player player && !isAuthenticated(player)) {
            event.setCancelled(true);
        }
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onInventoryOpen(InventoryOpenEvent event) {
        if (event.getPlayer() instanceof Player player && !isAuthenticated(player)) {
            event.setCancelled(true);
        }
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onSwapHands(PlayerSwapHandItemsEvent event) {
        if (!isAuthenticated(event.getPlayer())) {
            event.setCancelled(true);
        }
    }

    @EventHandler
    public void onQuit(PlayerQuitEvent event) {
        UUID id = event.getPlayer().getUniqueId();
        if (profileStore != null) {
            profileStore.endSession(event.getPlayer());
        }
        authenticated.remove(id);
        inFlight.remove(id);
        attemptsBySession.remove(id);
    }

    private AuthResult checkAccount(String username, String password) throws IOException, InterruptedException {
        String requestBody = "{\"username\":" + jsonString(username);
        if (password != null) {
            requestBody += ",\"password\":" + jsonString(password);
        }
        requestBody += "}";

        HttpRequest request = HttpRequest.newBuilder(authUri)
                .timeout(Duration.ofSeconds(5))
                .header("Authorization", "Bearer " + authSecret)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (response.statusCode() != 200) {
            throw new IOException("auth service returned HTTP " + response.statusCode());
        }
        Boolean registered = booleanField(response.body(), "registered");
        Boolean banned = booleanField(response.body(), "banned");
        Boolean passwordValid = password == null ? null : booleanField(response.body(), "passwordValid");
        if (registered == null || banned == null || (password != null && passwordValid == null)) {
            throw new IOException("auth service returned an invalid response");
        }
        return new AuthResult(registered, banned, passwordValid);
    }

    private static Boolean booleanField(String json, String field) {
        Matcher matcher = BOOLEAN_FIELD.matcher(json);
        while (matcher.find()) {
            if (matcher.group(1).equals(field)) {
                return Boolean.parseBoolean(matcher.group(2));
            }
        }
        return null;
    }

    private static String jsonString(String value) {
        StringBuilder encoded = new StringBuilder(value.length() + 2).append('"');
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            switch (c) {
                case '"' -> encoded.append("\\\"");
                case '\\' -> encoded.append("\\\\");
                case '\b' -> encoded.append("\\b");
                case '\f' -> encoded.append("\\f");
                case '\n' -> encoded.append("\\n");
                case '\r' -> encoded.append("\\r");
                case '\t' -> encoded.append("\\t");
                default -> {
                    if (c < 0x20) {
                        encoded.append(String.format("\\u%04x", (int) c));
                    } else {
                        encoded.append(c);
                    }
                }
            }
        }
        return encoded.append('"').toString();
    }

    private boolean isAuthenticated(Player player) {
        return authenticated.containsKey(player.getUniqueId());
    }

    private static Component registrationMessage() {
        return Component.text("Требуется регистрация на сайте ").append(registrationLink());
    }

    private static Component registrationLink() {
        return Component.text(REGISTER_URL).clickEvent(ClickEvent.openUrl(REGISTER_URL));
    }

    private record AuthResult(boolean registered, boolean banned, Boolean passwordValid) {}
    private record FailureState(int failures, long windowEnd, long lockedUntil) {}
}
