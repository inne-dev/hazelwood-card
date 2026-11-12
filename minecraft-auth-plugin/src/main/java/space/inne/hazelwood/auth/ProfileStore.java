package space.inne.hazelwood.auth;

import io.papermc.paper.advancement.AdvancementDisplay;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import net.kyori.adventure.text.TranslatableComponent;
import net.kyori.adventure.text.serializer.plain.PlainTextComponentSerializer;
import org.bukkit.Bukkit;
import org.bukkit.World;
import org.bukkit.advancement.Advancement;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.PlayerDeathEvent;
import org.bukkit.event.player.PlayerAdvancementDoneEvent;
import org.bukkit.event.player.PlayerChangedWorldEvent;
import org.bukkit.plugin.java.JavaPlugin;

final class ProfileStore implements Listener {
    private static final int MAX_HISTORY = 250;
    private static final long SNAPSHOT_INTERVAL_MS = 15_000;

    private final JavaPlugin plugin;
    private final Path portalDirectory;
    private final Path profilesDirectory;
    private final Map<String, String> englishTranslations;
    private final Map<UUID, Profile> profiles = new HashMap<>();
    private final Map<UUID, GameplaySession> sessions = new HashMap<>();
    private final ExecutorService writer = Executors.newSingleThreadExecutor(task -> {
        Thread thread = new Thread(task, "HazelwoodAuth-profile-writer");
        thread.setDaemon(true);
        return thread;
    });

    private long lastSnapshotAt;

    ProfileStore(JavaPlugin plugin) throws IOException {
        this.plugin = plugin;
        this.portalDirectory = plugin.getDataFolder().toPath().resolve("portal");
        this.profilesDirectory = portalDirectory.resolve("profiles");
        Files.createDirectories(profilesDirectory);
        this.englishTranslations = loadEnglishTranslations();
    }

    void exportAdvancementCatalog() {
        List<Map<String, Object>> advancements = new ArrayList<>();
        PlainTextComponentSerializer plainText = PlainTextComponentSerializer.plainText();
        var iterator = Bukkit.advancementIterator();
        while (iterator.hasNext()) {
            Advancement advancement = iterator.next();
            AdvancementDisplay display = advancement.getDisplay();
            if (display == null) {
                continue;
            }
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("id", advancement.getKey().toString());
            entry.put("title", componentText(display.title(), plainText));
            entry.put("description", componentText(display.description(), plainText));
            advancements.add(entry);
        }
        advancements.sort(Comparator.comparing(entry -> String.valueOf(entry.get("id"))));
        Map<String, Object> catalog = new LinkedHashMap<>();
        catalog.put("advancements", advancements);
        writeAsync(portalDirectory.resolve("catalog.json"), catalog);
    }

    synchronized void beginSession(Player player) {
        UUID uuid = player.getUniqueId();
        Profile profile = profile(uuid, player.getName());
        long now = System.currentTimeMillis();
        if (profile.trackingSince == null) {
            profile.trackingSince = Instant.ofEpochMilli(now).toString();
        }
        profile.username = player.getName();
        profile.updatedAt = Instant.ofEpochMilli(now).toString();
        GameplaySession previous = sessions.remove(uuid);
        if (previous != null) {
            finishSession(profile, previous, now);
        }
        World.Environment environment = player.getWorld().getEnvironment();
        String dimension = dimensionName(environment);
        sessions.put(uuid, new GameplaySession(now, dimension));
        queueWrite(profile);
    }

    synchronized void tickSessions() {
        long now = System.currentTimeMillis();
        for (Map.Entry<UUID, GameplaySession> entry : sessions.entrySet()) {
            Player player = Bukkit.getPlayer(entry.getKey());
            if (player == null || !player.isOnline()) {
                continue;
            }
            Profile profile = profiles.get(entry.getKey());
            if (profile == null) {
                continue;
            }
            GameplaySession session = entry.getValue();
            accrue(profile, session, now);
            String currentDimension = dimensionName(player.getWorld().getEnvironment());
            if (!currentDimension.equals(session.dimension())) {
                session.changeDimension(currentDimension);
            }
            profile.updatedAt = Instant.ofEpochMilli(now).toString();
        }
        if (now - lastSnapshotAt >= SNAPSHOT_INTERVAL_MS) {
            lastSnapshotAt = now;
            snapshotAll();
        }
    }

    synchronized void endSession(Player player) {
        UUID uuid = player.getUniqueId();
        GameplaySession session = sessions.remove(uuid);
        Profile profile = profiles.get(uuid);
        if (session == null || profile == null) {
            return;
        }
        long now = System.currentTimeMillis();
        finishSession(profile, session, now);
    }

    synchronized void recordAdvancement(Player player, String advancementId) {
        GameplaySession session = sessions.get(player.getUniqueId());
        if (session != null) {
            session.recordAdvancement(advancementId);
        }
    }

    synchronized void recordSkin(String username, UUID uuid, String textureURL, String model) {
        long now = System.currentTimeMillis();
        Profile profile = profile(uuid, username);
        profile.username = username;
        if (profile.trackingSince == null) {
            profile.trackingSince = Instant.ofEpochMilli(now).toString();
        }
        profile.textureURL = textureURL;
        profile.model = model;
        profile.updatedAt = Instant.ofEpochMilli(now).toString();
        queueWrite(profile);
    }

    @EventHandler
    public void onPlayerAdvancement(PlayerAdvancementDoneEvent event) {
        Player player = event.getPlayer();
        if (event.getAdvancement().getDisplay() != null) {
            recordAdvancement(player, event.getAdvancement().getKey().toString());
        }
    }

    @EventHandler
    public void onPlayerChangedWorld(PlayerChangedWorldEvent event) {
        synchronized (this) {
            UUID uuid = event.getPlayer().getUniqueId();
            GameplaySession session = sessions.get(uuid);
            Profile profile = profiles.get(uuid);
            if (session == null || profile == null) {
                return;
            }
            long now = System.currentTimeMillis();
            accrue(profile, session, now);
            session.changeDimension(dimensionName(event.getPlayer().getWorld().getEnvironment()));
        }
    }

    @EventHandler
    public void onPlayerDeath(PlayerDeathEvent event) {
        synchronized (this) {
            GameplaySession session = sessions.get(event.getEntity().getUniqueId());
            if (session != null) {
                session.recordDeath();
            }
        }
    }

    synchronized void flushAndStop() {
        long now = System.currentTimeMillis();
        for (Map.Entry<UUID, GameplaySession> entry : new ArrayList<>(sessions.entrySet())) {
            Profile profile = profiles.get(entry.getKey());
            if (profile == null) {
                continue;
            }
            finishSession(profile, entry.getValue(), now);
        }
        sessions.clear();
        snapshotAll();
        writer.shutdown();
        try {
            if (!writer.awaitTermination(4, TimeUnit.SECONDS)) {
                writer.shutdownNow();
            }
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            writer.shutdownNow();
        }
    }

    private void accrue(Profile profile, GameplaySession session, long now) {
        String dimension = session.dimension();
        long elapsed = session.accrue(now);
        if (dimension != null) {
            profile.dimensionMillis.merge(dimension, elapsed, Long::sum);
        }
    }

    private void finishSession(Profile profile, GameplaySession session, long now) {
        accrue(profile, session, now);
        if (session.qualifies(now)) {
            addHistory(profile, new HistoryEvent(
                    "gameplay_session",
                    Instant.ofEpochMilli(now).toString(),
                    Instant.ofEpochMilli(session.startedAt()).toString(),
                    session.durationSeconds(now),
                    session.deaths(),
                    session.dimensionsSeconds(),
                    session.advancements(),
                    null,
                    null));
        }
        profile.updatedAt = Instant.ofEpochMilli(now).toString();
        queueWrite(profile);
    }

    private void addHistory(Profile profile, HistoryEvent event) {
        profile.history.add(event);
        while (profile.history.size() > MAX_HISTORY) {
            profile.history.remove(0);
        }
    }

    private Profile profile(UUID uuid, String username) {
        return profiles.computeIfAbsent(uuid, ignored -> readProfile(uuid, username));
    }

    private Profile readProfile(UUID uuid, String username) {
        Path path = profilesDirectory.resolve(uuid + ".json");
        if (!Files.isRegularFile(path)) {
            return new Profile(uuid, username);
        }
        try {
            Object parsed = JsonCodec.parse(Files.readString(path, StandardCharsets.UTF_8));
            if (!(parsed instanceof Map<?, ?> data)) {
                throw new IllegalArgumentException("Profile JSON is not an object");
            }
            Profile profile = new Profile(uuid, stringValue(data.get("username"), username));
            profile.trackingSince = nullableString(data.get("trackingSince"));
            profile.updatedAt = nullableString(data.get("updatedAt"));
            Object dimensions = data.get("dimensions");
            if (dimensions instanceof Map<?, ?> values) {
                loadDimension(values, "overworld", profile);
                loadDimension(values, "nether", profile);
                loadDimension(values, "end", profile);
            }
            Object history = data.get("history");
            if (history instanceof List<?> items) {
                for (Object item : items) {
                    HistoryEvent event = parseHistory(item);
                    if (event != null) {
                        profile.history.add(event);
                    }
                }
                while (profile.history.size() > MAX_HISTORY) {
                    profile.history.remove(0);
                }
            }
            Object skin = data.get("skin");
            if (skin instanceof Map<?, ?> skinData) {
                profile.textureURL = nullableString(skinData.get("textureURL"));
                profile.model = nullableString(skinData.get("model"));
            }
            return profile;
        } catch (Exception error) {
            plugin.getLogger().warning("Could not read profile for " + uuid + " (" + error.getClass().getSimpleName() + ").");
            return new Profile(uuid, username);
        }
    }

    private void loadDimension(Map<?, ?> values, String key, Profile profile) {
        Object raw = values.get(key);
        if (raw instanceof Number number) {
            profile.dimensionMillis.put(key, Math.min(Long.MAX_VALUE / 1000L, Math.max(0, number.longValue())) * 1000L);
        }
    }

    private HistoryEvent parseHistory(Object value) {
        if (!(value instanceof Map<?, ?> data)) {
            return null;
        }
        String type = nullableString(data.get("type"));
        String at = nullableString(data.get("at"));
        if (type == null || at == null) {
            return null;
        }
        long durationSeconds = 0;
        Object duration = data.get("durationSeconds");
        if (duration instanceof Number number) {
            durationSeconds = Math.max(0, number.longValue());
        }
        String startedAt = nullableString(data.get("startedAt"));
        int deaths = 0;
        Object rawDeaths = data.get("deaths");
        if (rawDeaths instanceof Number number) {
            deaths = (int) Math.min(Integer.MAX_VALUE, Math.max(0, number.longValue()));
        }
        Map<String, Long> sessionDimensions = new LinkedHashMap<>();
        Object rawSessionDimensions = data.get("dimensions");
        if (rawSessionDimensions instanceof Map<?, ?> values) {
            for (Map.Entry<?, ?> entry : values.entrySet()) {
                if (entry.getKey() instanceof String key && entry.getValue() instanceof Number number) {
                    sessionDimensions.put(key, Math.max(0, number.longValue()));
                }
            }
        }
        List<String> advancements = new ArrayList<>();
        Object rawAdvancements = data.get("advancements");
        if (rawAdvancements instanceof List<?> items) {
            for (Object item : items) {
                if (item instanceof String advancementId) {
                    advancements.add(advancementId);
                }
            }
        }
        return new HistoryEvent(type, at, startedAt, durationSeconds, deaths, sessionDimensions, advancements,
                nullableString(data.get("dimension")), nullableString(data.get("advancementId")));
    }

    private Map<String, Object> toJson(Profile profile) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("username", profile.username);
        data.put("uuid", profile.uuid.toString());
        data.put("updatedAt", profile.updatedAt == null ? Instant.now().toString() : profile.updatedAt);
        data.put("trackingSince", profile.trackingSince);

        Map<String, Object> dimensions = new LinkedHashMap<>();
        dimensions.put("overworld", profile.dimensionMillis.getOrDefault("overworld", 0L) / 1000L);
        dimensions.put("nether", profile.dimensionMillis.getOrDefault("nether", 0L) / 1000L);
        dimensions.put("end", profile.dimensionMillis.getOrDefault("end", 0L) / 1000L);
        data.put("dimensions", dimensions);

        List<Map<String, Object>> history = new ArrayList<>();
        for (HistoryEvent event : profile.history) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("type", event.type());
            entry.put("at", event.at());
            entry.put("durationSeconds", event.durationSeconds());
            entry.put("startedAt", event.startedAt());
            entry.put("deaths", event.deaths());
            entry.put("dimensions", event.dimensions());
            entry.put("advancements", event.advancements());
            entry.put("dimension", event.dimension());
            entry.put("advancementId", event.advancementId());
            history.add(entry);
        }
        data.put("history", history);

        Map<String, Object> skin = new LinkedHashMap<>();
        skin.put("textureURL", profile.textureURL);
        skin.put("model", profile.model);
        data.put("skin", skin);
        return data;
    }

    private synchronized void queueWrite(Profile profile) {
        writeAsync(profilesDirectory.resolve(profile.uuid + ".json"), toJson(profile));
    }

    private synchronized void snapshotAll() {
        for (Profile profile : profiles.values()) {
            writeAsync(profilesDirectory.resolve(profile.uuid + ".json"), toJson(profile));
        }
    }

    private void writeAsync(Path path, Object data) {
        String json = JsonCodec.stringify(data);
        writer.execute(() -> writeAtomic(path, json));
    }

    private void writeAtomic(Path path, String json) {
        Path temporary = path.resolveSibling(path.getFileName() + ".tmp");
        try {
            Files.createDirectories(path.getParent());
            Files.writeString(temporary, json, StandardCharsets.UTF_8);
            try {
                Files.move(temporary, path, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
            } catch (AtomicMoveNotSupportedException ignored) {
                Files.move(temporary, path, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException error) {
            plugin.getLogger().warning("Could not export portal data (" + error.getClass().getSimpleName() + ").");
            try {
                Files.deleteIfExists(temporary);
            } catch (IOException ignored) {
                // Keep the original file when cleanup also fails.
            }
        }
    }

    private static String dimensionName(World.Environment environment) {
        return switch (environment) {
            case NORMAL -> "overworld";
            case NETHER -> "nether";
            case THE_END -> "end";
            default -> "overworld";
        };
    }

    private String componentText(net.kyori.adventure.text.Component component,
            PlainTextComponentSerializer plainText) {
        if (component instanceof TranslatableComponent translatable) {
            String translation = englishTranslations.get(translatable.key());
            if (translation == null) {
                translation = readableKey(translatable.key());
            }
            if (!translatable.arguments().isEmpty()) {
                Object[] arguments = translatable.arguments().stream()
                        .map(argument -> plainText.serialize(argument.asComponent()))
                        .toArray();
                try {
                    translation = String.format(Locale.ROOT, translation, arguments);
                } catch (java.util.IllegalFormatException ignored) {
                    // Keep the readable translation when a vanilla format does not match String.format.
                }
            }
            for (net.kyori.adventure.text.Component child : translatable.children()) {
                translation += plainText.serialize(child);
            }
            return translation;
        }
        return plainText.serialize(component);
    }

    private Map<String, String> loadEnglishTranslations() {
        Path worldContainer = plugin.getServer().getWorldContainer().toPath();
        Path minecraftClient = worldContainer.resolve("bluemap/minecraft-client-" + Bukkit.getMinecraftVersion() + ".jar");
        Map<String, String> translations = readTranslationsFromJar(minecraftClient);
        if (!translations.isEmpty()) {
            return translations;
        }

        Path flectoneTranslations = plugin.getDataFolder().toPath().getParent()
                .resolve("FlectonePulse/minecraft/" + Bukkit.getMinecraftVersion() + "/lang/en_us.json");
        try {
            if (Files.isRegularFile(flectoneTranslations)) {
                return translationMap(Files.readString(flectoneTranslations, StandardCharsets.UTF_8));
            }
        } catch (IOException error) {
            plugin.getLogger().fine("Could not load the English advancement catalog (" + error.getClass().getSimpleName() + ").");
        }
        return Map.of();
    }

    private Map<String, String> readTranslationsFromJar(Path jarPath) {
        if (!Files.isRegularFile(jarPath)) {
            return Map.of();
        }
        try (ZipFile jar = new ZipFile(jarPath.toFile())) {
            ZipEntry entry = jar.getEntry("assets/minecraft/lang/en_us.json");
            if (entry == null || entry.getSize() > 2_000_000) {
                return Map.of();
            }
            try (InputStream stream = jar.getInputStream(entry)) {
                byte[] bytes = stream.readNBytes(2_000_001);
                if (bytes.length > 2_000_000) {
                    return Map.of();
                }
                return translationMap(new String(bytes, StandardCharsets.UTF_8));
            }
        } catch (Exception error) {
            plugin.getLogger().fine("Could not load Minecraft's English language data (" + error.getClass().getSimpleName() + ").");
            return Map.of();
        }
    }

    private Map<String, String> translationMap(String json) {
        try {
            Object parsed = JsonCodec.parse(json);
            if (!(parsed instanceof Map<?, ?> map)) {
                return Map.of();
            }
            Map<String, String> translations = new HashMap<>();
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                if (entry.getKey() instanceof String key && entry.getValue() instanceof String value) {
                    translations.put(key, value);
                }
            }
            return translations;
        } catch (IllegalArgumentException error) {
            plugin.getLogger().fine("Could not parse Minecraft's English language data.");
            return Map.of();
        }
    }

    private static String readableKey(String key) {
        String readable = key;
        if (readable.startsWith("advancements.")) {
            readable = readable.substring("advancements.".length());
        }
        readable = readable.replaceFirst("\\.(title|desc)$", "");
        return readable.replace('.', ' ').replace('_', ' ');
    }

    private static String stringValue(Object value, String fallback) {
        return value instanceof String text ? text : fallback;
    }

    private static String nullableString(Object value) {
        return value instanceof String text ? text : null;
    }

    private static final class Profile {
        private final UUID uuid;
        private String username;
        private String updatedAt;
        private String trackingSince;
        private final Map<String, Long> dimensionMillis = new HashMap<>();
        private final List<HistoryEvent> history = new ArrayList<>();
        private String textureURL;
        private String model;

        private Profile(UUID uuid, String username) {
            this.username = username;
            this.uuid = uuid;
        }
    }

    private record HistoryEvent(String type, String at, String startedAt, long durationSeconds, int deaths,
            Map<String, Long> dimensions, List<String> advancements, String dimension, String advancementId) {}
}
