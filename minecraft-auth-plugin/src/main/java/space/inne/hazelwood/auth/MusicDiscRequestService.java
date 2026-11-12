package space.inne.hazelwood.auth;

import dev.valkdz.cdisc.api.CDiscApi;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Predicate;
import java.util.regex.Pattern;
import net.kyori.adventure.text.Component;
import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;
import org.bukkit.plugin.Plugin;
import org.bukkit.plugin.java.JavaPlugin;

final class MusicDiscRequestService {
    private static final Pattern REQUEST_ID = Pattern.compile("(?i)[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}");
    private static final Pattern PLAYER_NAME = Pattern.compile("[A-Za-z0-9_]{1,16}");
    private static final int MAX_RESPONSE_BYTES = 1024 * 1024;
    private static final int MAX_AUDIO_BYTES = 8 * 1024 * 1024;
    private static final int MAX_TITLE_LENGTH = 128;
    private static final String STATUS_PENDING = "pending";
    private static final String STATUS_COMPLETED = "completed";
    private static final String STATUS_FAILED = "failed";

    private final JavaPlugin plugin;
    private final HttpClient httpClient;
    private final String authSecret;
    private final URI portalOrigin;
    private final Predicate<Player> authenticatedRecipient;
    private final Set<String> claimedRequestIds = ConcurrentHashMap.newKeySet();

    MusicDiscRequestService(JavaPlugin plugin, HttpClient httpClient, String authSecret, URI authUri,
            Predicate<Player> authenticatedRecipient) {
        this.plugin = plugin;
        this.httpClient = httpClient;
        this.authSecret = authSecret;
        this.portalOrigin = URI.create(authUri.getScheme() + "://" + authUri.getRawAuthority());
        this.authenticatedRecipient = authenticatedRecipient;
    }

    boolean request(String requestId) {
        if (requestId == null || !REQUEST_ID.matcher(requestId).matches()) {
            return false;
        }
        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            try {
                MusicDiscRequest request = fetchRequest(requestId);
                Bukkit.getScheduler().runTask(plugin, () -> {
                    Player recipient = findOnlineRecipient(request.recipient());
                    if (recipient != null) {
                        processForPlayer(request, recipient);
                    }
                });
            } catch (Exception error) {
                plugin.getLogger().warning("Could not fetch music disc request (" + error.getClass().getSimpleName() + ").");
            }
        });
        return true;
    }

    void fetchPendingFor(Player player) {
        UUID playerId = player.getUniqueId();
        String playerName = player.getName();
        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            try {
                List<MusicDiscRequest> requests = fetchPending(playerName);
                Bukkit.getScheduler().runTask(plugin, () -> {
                    Player online = Bukkit.getPlayer(playerId);
                    if (online == null || !online.getName().equalsIgnoreCase(playerName)) {
                        return;
                    }
                    for (MusicDiscRequest request : requests) {
                        if (request.recipient().equalsIgnoreCase(playerName)) {
                            processForPlayer(request, online);
                        }
                    }
                });
            } catch (Exception error) {
                plugin.getLogger().warning("Could not fetch music disc requests (" + error.getClass().getSimpleName() + ").");
            }
        });
    }

    private void processForPlayer(MusicDiscRequest request, Player player) {
        if (!STATUS_PENDING.equals(request.status())
                || !request.recipient().equalsIgnoreCase(player.getName())
                || !authenticatedRecipient.test(player)
                || !claimedRequestIds.add(request.requestId())) {
            return;
        }

        player.sendMessage(Component.text("Загружаю трек «" + request.title() + "»."));
        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            try {
                byte[] audio = fetchAudio(request.requestId());
                Path localDirectory = cdiscLocalDirectory();
                Files.createDirectories(localDirectory);
                String fileName = audioFileName(request.requestId());
                Path audioFile = localDirectory.resolve(fileName);
                Path temporaryFile = Files.createTempFile(localDirectory, ".hazelwood-disc-", ".ogg.tmp");
                try {
                    Files.write(temporaryFile, audio);
                    try {
                        Files.move(temporaryFile, audioFile, StandardCopyOption.REPLACE_EXISTING,
                                StandardCopyOption.ATOMIC_MOVE);
                    } catch (AtomicMoveNotSupportedException ignored) {
                        Files.move(temporaryFile, audioFile, StandardCopyOption.REPLACE_EXISTING);
                    }
                } finally {
                    Files.deleteIfExists(temporaryFile);
                }
                Bukkit.getScheduler().runTask(plugin, () -> createAndGive(request, player.getUniqueId(),
                        player.getName(), fileName));
            } catch (Exception error) {
                Bukkit.getScheduler().runTask(plugin, () -> failIfStillOnline(request, player.getUniqueId(),
                        player.getName(), error));
            }
        });
    }

    private Path cdiscLocalDirectory() throws IOException {
        Plugin cdisc = Bukkit.getPluginManager().getPlugin("CDisc");
        if (cdisc == null || !cdisc.isEnabled()) {
            throw new IOException("CDisc is not available");
        }
        return cdisc.getDataFolder().toPath().resolve("local");
    }

    private void createAndGive(MusicDiscRequest request, UUID playerId, String playerName, String fileName) {
        Player player = currentAuthenticatedRecipient(playerId, playerName);
        if (player == null) {
            claimedRequestIds.remove(request.requestId());
            return;
        }

        try {
            CDiscApi.createDisc("local:" + fileName).whenComplete((disc, error) ->
                    Bukkit.getScheduler().runTask(plugin, () -> {
                        Player online = currentAuthenticatedRecipient(playerId, playerName);
                        if (online == null) {
                            claimedRequestIds.remove(request.requestId());
                            return;
                        }
                        if (error != null || disc == null || disc.getType().isAir()) {
                            Throwable cause = error instanceof CompletionException && error.getCause() != null
                                    ? error.getCause() : error != null ? error
                                    : new IllegalStateException("CDisc returned no music disc item");
                            failRequest(request, online, "CDisc could not create disc",
                                    "Не удалось создать музыкальный диск.", cause);
                            return;
                        }
                        giveDisc(request, online, disc);
                    }));
        } catch (RuntimeException | LinkageError error) {
            failRequest(request, player, "CDisc API failed", "Не удалось создать музыкальный диск.", error);
        }
    }

    private void giveDisc(MusicDiscRequest request, Player player, ItemStack createdDisc) {
        try {
            ItemStack disc = createdDisc.clone();
            ItemMeta meta = disc.getItemMeta();
            meta.displayName(Component.text(request.title()));
            disc.setItemMeta(meta);

            Map<Integer, ItemStack> overflow = player.getInventory().addItem(disc);
            for (ItemStack leftover : overflow.values()) {
                player.getWorld().dropItemNaturally(player.getLocation(), leftover);
            }
            player.sendMessage(Component.text("Диск «" + request.title() + "» готов. Поставь его в проигрыватель."));
            postResult(request.requestId(), STATUS_COMPLETED, null,
                    () -> claimedRequestIds.remove(request.requestId()));
        } catch (RuntimeException error) {
            failRequest(request, player, "Could not give music disc", "Не удалось выдать музыкальный диск.", error);
        }
    }

    private Player currentAuthenticatedRecipient(UUID playerId, String playerName) {
        Player online = Bukkit.getPlayer(playerId);
        if (online == null || !online.getName().equalsIgnoreCase(playerName)
                || !authenticatedRecipient.test(online)) {
            return null;
        }
        return online;
    }

    private void failIfStillOnline(MusicDiscRequest request, UUID playerId, String playerName, Exception error) {
        Player player = currentAuthenticatedRecipient(playerId, playerName);
        if (player == null) {
            claimedRequestIds.remove(request.requestId());
            return;
        }
        failRequest(request, player, "Could not prepare music disc audio", "Не удалось подготовить аудио диска.", error);
    }

    private void failRequest(MusicDiscRequest request, Player player, String errorMessage,
            String playerMessage, Throwable error) {
        plugin.getLogger().warning(errorMessage + " (" + error.getClass().getSimpleName() + ").");
        if (player != null && player.isOnline()) {
            player.sendMessage(Component.text(playerMessage));
        }
        postResult(request.requestId(), "failed", errorMessage,
                () -> claimedRequestIds.remove(request.requestId()));
    }

    private byte[] fetchAudio(String requestId) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder(URI.create(requestUri(requestId).toASCIIString() + "/audio"))
                .timeout(Duration.ofSeconds(30))
                .header("Authorization", "Bearer " + authSecret)
                .GET()
                .build();
        HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
        try (InputStream stream = response.body()) {
            byte[] audio = stream.readNBytes(MAX_AUDIO_BYTES + 1);
            if (response.statusCode() != 200) {
                throw new IOException("Portal returned HTTP " + response.statusCode() + " for music disc audio");
            }
            if (audio.length < 4 || audio.length > MAX_AUDIO_BYTES) {
                throw new IOException("Portal returned invalid music disc audio size");
            }
            if (audio[0] != 'O' || audio[1] != 'g' || audio[2] != 'g' || audio[3] != 'S') {
                throw new IOException("Portal returned non-Ogg music disc audio");
            }
            return audio;
        }
    }

    private void postResult(String requestId, String status, String error) {
        postResult(requestId, status, error, () -> {});
    }

    private void postResult(String requestId, String status, String error, Runnable afterReport) {
        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            boolean resultReported = false;
            try {
                Map<String, Object> body = new LinkedHashMap<>();
                body.put("status", status);
                if (error != null) {
                    body.put("error", error);
                }
                HttpRequest request = HttpRequest.newBuilder(URI.create(requestUri(requestId).toASCIIString() + "/result"))
                        .timeout(Duration.ofSeconds(10))
                        .header("Authorization", "Bearer " + authSecret)
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(JsonCodec.stringify(body), StandardCharsets.UTF_8))
                        .build();
                HttpResponse<Void> response = httpClient.send(request, HttpResponse.BodyHandlers.discarding());
                resultReported = response.statusCode() >= 200 && response.statusCode() < 300;
                if (!resultReported) {
                    plugin.getLogger().warning("Portal rejected music disc result with HTTP " + response.statusCode() + ".");
                }
            } catch (Exception exception) {
                plugin.getLogger().warning("Could not report music disc result (" + exception.getClass().getSimpleName() + ").");
            } finally {
                if (resultReported || STATUS_FAILED.equals(status)) {
                    afterReport.run();
                }
            }
        });
    }

    private MusicDiscRequest fetchRequest(String requestId) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder(requestUri(requestId))
                .timeout(Duration.ofSeconds(15))
                .header("Authorization", "Bearer " + authSecret)
                .GET()
                .build();
        HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
        try (InputStream stream = response.body()) {
            byte[] body = stream.readNBytes(MAX_RESPONSE_BYTES + 1);
            if (body.length > MAX_RESPONSE_BYTES) {
                throw new IOException("Music disc request is too large");
            }
            if (response.statusCode() != 200) {
                throw new IOException("Portal returned HTTP " + response.statusCode());
            }
            return parseRequest(body);
        }
    }

    private List<MusicDiscRequest> fetchPending(String recipient) throws IOException, InterruptedException {
        String query = "?recipient=" + URLEncoder.encode(recipient, StandardCharsets.UTF_8);
        HttpRequest request = HttpRequest.newBuilder(portalOrigin.resolve("/internal/minecraft/music-disc-requests" + query))
                .timeout(Duration.ofSeconds(15))
                .header("Authorization", "Bearer " + authSecret)
                .GET()
                .build();
        HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
        try (InputStream stream = response.body()) {
            byte[] body = stream.readNBytes(MAX_RESPONSE_BYTES + 1);
            if (body.length > MAX_RESPONSE_BYTES) {
                throw new IOException("Music disc request list is too large");
            }
            if (response.statusCode() != 200) {
                throw new IOException("Portal returned HTTP " + response.statusCode());
            }
            Object parsed = JsonCodec.parse(new String(body, StandardCharsets.UTF_8));
            if (!(parsed instanceof Map<?, ?> data) || !(data.get("requests") instanceof List<?> values)) {
                throw new IOException("Portal returned an invalid music disc request list");
            }
            List<MusicDiscRequest> result = new ArrayList<>();
            for (Object value : values) {
                try {
                    result.add(parseRequest(value));
                } catch (IOException error) {
                    plugin.getLogger().warning("Skipping invalid music disc request.");
                }
            }
            return result;
        }
    }

    private MusicDiscRequest parseRequest(byte[] body) throws IOException {
        Object parsed;
        try {
            parsed = JsonCodec.parse(new String(body, StandardCharsets.UTF_8));
        } catch (IllegalArgumentException error) {
            throw new IOException("Portal returned invalid music disc JSON", error);
        }
        return parseRequest(parsed);
    }

    private MusicDiscRequest parseRequest(Object parsed) throws IOException {
        if (!(parsed instanceof Map<?, ?> data)) {
            throw new IOException("Portal returned an invalid music disc request");
        }
        String id = requiredString(data, "id");
        String requestId = requiredString(data, "requestId");
        if (!REQUEST_ID.matcher(id).matches() || !REQUEST_ID.matcher(requestId).matches()
                || !id.equalsIgnoreCase(requestId)) {
            throw new IOException("Portal returned inconsistent music disc request IDs");
        }
        String status = requiredString(data, "status");
        if (!STATUS_PENDING.equals(status) && !STATUS_COMPLETED.equals(status) && !STATUS_FAILED.equals(status)) {
            throw new IOException("Portal returned an invalid music disc request status");
        }
        String recipient = requiredString(data, "recipient");
        if (!PLAYER_NAME.matcher(recipient).matches()) {
            throw new IOException("Portal returned an invalid recipient");
        }
        String title = requiredString(data, "title");
        if (title.length() > MAX_TITLE_LENGTH) {
            throw new IOException("Portal returned an invalid music disc title");
        }
        return new MusicDiscRequest(UUID.fromString(requestId).toString(), recipient, title, status);
    }

    private URI requestUri(String requestId) {
        if (!REQUEST_ID.matcher(requestId).matches()) {
            throw new IllegalArgumentException("Invalid music disc request ID");
        }
        return portalOrigin.resolve("/internal/minecraft/music-disc-requests/" + requestId);
    }

    static String audioFileName(String requestId) {
        if (requestId == null || !REQUEST_ID.matcher(requestId).matches()) {
            throw new IllegalArgumentException("Invalid music disc request ID");
        }
        return UUID.fromString(requestId).toString() + ".ogg";
    }

    private Player findOnlineRecipient(String recipient) {
        for (Player player : Bukkit.getOnlinePlayers()) {
            if (player.getName().equalsIgnoreCase(recipient)) {
                return player;
            }
        }
        return null;
    }

    private static String requiredString(Map<?, ?> data, String key) throws IOException {
        Object value = data.get(key);
        if (value instanceof String text && !text.isBlank()) {
            return text;
        }
        throw new IOException("Missing music disc request field " + key);
    }

    private record MusicDiscRequest(String requestId, String recipient, String title, String status) {}
}
