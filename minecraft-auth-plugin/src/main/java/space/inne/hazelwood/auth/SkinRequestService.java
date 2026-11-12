package space.inne.hazelwood.auth;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;
import javax.imageio.ImageIO;
import net.skinsrestorer.api.PropertyUtils;
import net.skinsrestorer.api.SkinsRestorer;
import net.skinsrestorer.api.SkinsRestorerProvider;
import net.skinsrestorer.api.VersionProvider;
import net.skinsrestorer.api.connections.model.MineSkinResponse;
import net.skinsrestorer.api.exception.DataRequestException;
import net.skinsrestorer.api.exception.MineSkinException;
import net.skinsrestorer.api.property.InputDataResult;
import net.skinsrestorer.api.property.SkinIdentifier;
import net.skinsrestorer.api.property.SkinProperty;
import net.skinsrestorer.api.property.SkinVariant;
import net.skinsrestorer.api.storage.SkinStorage;
import org.bukkit.Bukkit;
import org.bukkit.OfflinePlayer;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

final class SkinRequestService {
    private static final Pattern REQUEST_ID = Pattern.compile("[A-Za-z0-9_-]{1,80}");
    private static final Pattern USERNAME = Pattern.compile("[A-Za-z0-9_]{1,16}");
    private static final int MAX_PNG_BYTES = 1024 * 1024;
    private static final int MAX_REQUEST_BYTES = 1_500_000;
    private static final byte[] PNG_SIGNATURE = {(byte) 0x89, 'P', 'N', 'G', 13, 10, 26, 10};

    private final JavaPlugin plugin;
    private final ProfileStore profiles;
    private final java.net.http.HttpClient httpClient;
    private final String authSecret;
    private final URI portalOrigin;
    private final SkinsRestorer skinsRestorer;

    SkinRequestService(JavaPlugin plugin, ProfileStore profiles, java.net.http.HttpClient httpClient,
            String authSecret, URI authUri) {
        this.plugin = plugin;
        this.profiles = profiles;
        this.httpClient = httpClient;
        this.authSecret = authSecret;
        this.portalOrigin = URI.create(authUri.getScheme() + "://" + authUri.getRawAuthority());
        if (!VersionProvider.isCompatibleWith("15")) {
            throw new IllegalStateException("SkinsRestorer API major version is not compatible");
        }
        this.skinsRestorer = SkinsRestorerProvider.get();
    }

    void exportExistingSkins() {
        Map<UUID, String> knownPlayers = new LinkedHashMap<>();
        for (OfflinePlayer offlinePlayer : Bukkit.getOfflinePlayers()) {
            String username = offlinePlayer.getName();
            if (username != null && !username.isBlank()) {
                knownPlayers.put(offlinePlayer.getUniqueId(), username);
            }
        }
        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            for (Map.Entry<UUID, String> entry : knownPlayers.entrySet()) {
                exportPlayerSkin(entry.getValue(), entry.getKey());
            }
        });
    }

    void exportPlayerSkin(Player player) {
        String username = player.getName();
        UUID uuid = player.getUniqueId();
        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> exportPlayerSkin(username, uuid));
    }

    void applyAccountSkinOrExportSelection(Player player) {
        String username = player.getName();
        UUID uuid = player.getUniqueId();
        if (hasStoredSelection(uuid)) {
            exportPlayerSkin(username, uuid);
            return;
        }

        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            try {
                Optional<InputDataResult> found = skinsRestorer.getSkinStorage()
                        .findOrCreateSkinData(username, SkinVariant.CLASSIC);
                if (found.isEmpty()) {
                    throw new IOException("No Minecraft account skin was found for this name");
                }
                SkinProperty property = found.get().getProperty();
                Bukkit.getScheduler().runTask(plugin, () -> {
                    Player online = Bukkit.getPlayer(uuid);
                    if (online == null || !online.isOnline() || hasStoredSelection(uuid)) {
                        if (online != null && online.isOnline()) {
                            exportPlayerSkin(online);
                        }
                        return;
                    }
                    try {
                        skinsRestorer.getSkinApplier(Player.class).applySkin(online, property);
                        exportSkin(username, uuid, property);
                    } catch (Exception error) {
                        plugin.getLogger().warning("Could not apply a Minecraft account skin ("
                                + error.getClass().getSimpleName() + ").");
                    }
                });
            } catch (Exception error) {
                plugin.getLogger().warning("Could not resolve a Minecraft account skin by player name ("
                        + error.getClass().getSimpleName() + ").");
                exportPlayerSkin(username, uuid);
            }
        });
    }

    private boolean hasStoredSelection(UUID uuid) {
        return skinsRestorer.getPlayerStorage().getSkinIdOfPlayer(uuid).isPresent();
    }

    private void exportPlayerSkin(String username, UUID uuid) {
        try {
            Optional<SkinProperty> property = skinsRestorer.getPlayerStorage().getSkinForPlayer(uuid, username);
            property.ifPresent(skin -> exportSkin(username, uuid, skin));
        } catch (Exception error) {
            plugin.getLogger().fine("Could not export a player skin (" + error.getClass().getSimpleName() + ").");
        }
    }

    boolean request(String requestId) {
        if (!REQUEST_ID.matcher(requestId).matches()) {
            return false;
        }
        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> process(requestId));
        return true;
    }

    private void process(String requestId) {
        SkinRequest request = null;
        try {
            request = fetchRequest(requestId);
            SkinResult result = applySelection(requestId, request);
            SkinRequest completedRequest = request;
            Bukkit.getScheduler().runTask(plugin, () -> {
                try {
                    Player online = Bukkit.getPlayer(completedRequest.uuid());
                    skinsRestorer.getPlayerStorage().setSkinIdOfPlayer(completedRequest.uuid(), result.identifier());
                    if (online != null && online.isOnline()) {
                        skinsRestorer.getSkinApplier(Player.class).applySkin(online, result.property());
                    }
                    profiles.recordSkin(completedRequest.username(), completedRequest.uuid(), result.textureURL(), result.model());
                    postResult(requestId, new SkinResultBody("completed", result.textureURL(), result.model(), null));
                } catch (Exception error) {
                    plugin.getLogger().warning("Skin request failed while applying the selection (" + error.getClass().getSimpleName() + ").");
                    postResult(requestId, new SkinResultBody("failed", null, null, "Could not apply skin"));
                }
            });
        } catch (Exception error) {
            String message = safeFailure(error);
            plugin.getLogger().warning("Skin request failed (" + error.getClass().getSimpleName() + ").");
            postResult(requestId, new SkinResultBody("failed", null, null, message));
        }
    }

    private SkinRequest fetchRequest(String requestId) throws IOException, InterruptedException {
        URI uri = portalOrigin.resolve("/internal/minecraft/skin-requests/" + requestId);
        HttpRequest request = HttpRequest.newBuilder(uri)
                .timeout(java.time.Duration.ofSeconds(15))
                .header("Authorization", "Bearer " + authSecret)
                .GET()
                .build();
        HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
        try (InputStream stream = response.body()) {
            byte[] body = stream.readNBytes(MAX_REQUEST_BYTES + 1);
            if (body.length > MAX_REQUEST_BYTES) {
                throw new IOException("Skin request is too large");
            }
            if (response.statusCode() != 200) {
                throw new IOException("Portal returned HTTP " + response.statusCode());
            }
            Object parsed = JsonCodec.parse(new String(body, StandardCharsets.UTF_8));
            if (!(parsed instanceof Map<?, ?> data)) {
                throw new IOException("Portal returned an invalid skin request");
            }
            String username = requiredString(data, "username");
            String uuidText = requiredString(data, "uuid");
            String kind = requiredString(data, "kind");
            String value = requiredString(data, "value");
            String model = optionalString(data, "model");
            if (!USERNAME.matcher(username).matches()) {
                throw new IOException("Invalid player name");
            }
            UUID uuid;
            try {
                uuid = UUID.fromString(uuidText);
            } catch (IllegalArgumentException error) {
                throw new IOException("Invalid player UUID", error);
            }
            if (!kind.equals("player") && !kind.equals("upload")) {
                throw new IOException("Invalid skin request kind");
            }
            SkinVariant variant = parseVariant(model);
            return new SkinRequest(username, uuid, kind, value, variant);
        }
    }

    private SkinResult applySelection(String requestId, SkinRequest request)
            throws IOException, DataRequestException, MineSkinException {
        SkinStorage skinStorage = skinsRestorer.getSkinStorage();
        SkinProperty property;
        SkinIdentifier identifier;

        if (request.kind().equals("player")) {
            if (!USERNAME.matcher(request.value()).matches()) {
                throw new IOException("Invalid skin source name");
            }
            Optional<InputDataResult> found = skinStorage.findOrCreateSkinData(request.value(), request.variant());
            if (found.isEmpty()) {
                throw new IOException("Skin source was not found");
            }
            InputDataResult data = found.get();
            property = data.getProperty();
            identifier = data.getIdentifier();
        } else {
            byte[] png = decodePng(request.value());
            MineSkinResponse generated = skinsRestorer.getMineSkinAPI().genSkin(png, request.variant());
            property = generated.getProperty();
            String customName = "hazelwood-" + request.uuid() + "-" + requestId;
            skinStorage.setCustomSkinData(customName, property);
            identifier = SkinIdentifier.ofCustom(customName);
        }

        String textureURL = normalizeTextureURL(PropertyUtils.getSkinTextureUrl(property));
        if (textureURL == null) {
            throw new IOException("Skin has no valid texture URL");
        }
        SkinVariant variant = PropertyUtils.getSkinVariant(property);
        String model = (variant == null ? request.variant() : variant).name().toLowerCase(java.util.Locale.ROOT);
        return new SkinResult(property, identifier, textureURL, model);
    }

    private byte[] decodePng(String base64) throws IOException {
        if (base64.length() > ((MAX_PNG_BYTES + 2) / 3) * 4 + 8) {
            throw new IOException("Skin upload exceeds size limit");
        }
        byte[] bytes;
        try {
            bytes = Base64.getDecoder().decode(base64);
        } catch (IllegalArgumentException error) {
            throw new IOException("Skin upload is not valid base64", error);
        }
        if (bytes.length < 24 || bytes.length > MAX_PNG_BYTES) {
            throw new IOException("Skin upload has an invalid size");
        }
        for (int i = 0; i < PNG_SIGNATURE.length; i++) {
            if (bytes[i] != PNG_SIGNATURE[i]) {
                throw new IOException("Skin upload is not a PNG image");
            }
        }
        int width = intAt(bytes, 16);
        int height = intAt(bytes, 20);
        if (width != 64 || (height != 32 && height != 64)) {
            throw new IOException("Skin PNG must be 64x64 or 64x32 pixels");
        }
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(bytes));
        if (image == null || image.getWidth() != width || image.getHeight() != height) {
            throw new IOException("Skin upload is not a readable PNG");
        }
        return bytes;
    }

    private void postResult(String requestId, SkinResultBody result) {
        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            try {
                URI uri = portalOrigin.resolve("/internal/minecraft/skin-requests/" + requestId + "/result");
                Map<String, Object> body = new LinkedHashMap<>();
                body.put("status", result.status());
                body.put("textureURL", result.textureURL());
                body.put("model", result.model());
                if (result.error() != null) {
                    body.put("error", result.error());
                }
                HttpRequest request = HttpRequest.newBuilder(uri)
                        .timeout(java.time.Duration.ofSeconds(10))
                        .header("Authorization", "Bearer " + authSecret)
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(JsonCodec.stringify(body), StandardCharsets.UTF_8))
                        .build();
                HttpResponse<Void> response = httpClient.send(request, HttpResponse.BodyHandlers.discarding());
                if (response.statusCode() < 200 || response.statusCode() >= 300) {
                    plugin.getLogger().warning("Portal rejected skin result with HTTP " + response.statusCode() + ".");
                }
            } catch (Exception error) {
                plugin.getLogger().warning("Could not report skin request result (" + error.getClass().getSimpleName() + ").");
            }
        });
    }

    private void exportSkin(String username, UUID uuid, SkinProperty property) {
        try {
            String textureURL = normalizeTextureURL(PropertyUtils.getSkinTextureUrl(property));
            if (textureURL == null) {
                return;
            }
            SkinVariant variant = PropertyUtils.getSkinVariant(property);
            String model = variant == null ? null : variant.name().toLowerCase(java.util.Locale.ROOT);
            profiles.recordSkin(username, uuid, textureURL, model);
        } catch (Exception error) {
            plugin.getLogger().fine("Could not export an existing skin (" + error.getClass().getSimpleName() + ").");
        }
    }

    private static SkinVariant parseVariant(String model) throws IOException {
        if (model == null || model.isBlank() || model.equalsIgnoreCase("classic")) {
            return SkinVariant.CLASSIC;
        }
        if (model.equalsIgnoreCase("slim")) {
            return SkinVariant.SLIM;
        }
        throw new IOException("Invalid skin model");
    }

    private static String requiredString(Map<?, ?> data, String key) throws IOException {
        Object value = data.get(key);
        if (value instanceof String text && !text.isBlank()) {
            return text;
        }
        throw new IOException("Missing skin request field " + key);
    }

    private static String optionalString(Map<?, ?> data, String key) {
        Object value = data.get(key);
        return value instanceof String text ? text : null;
    }

    private static int intAt(byte[] bytes, int offset) {
        return ((bytes[offset] & 0xff) << 24)
                | ((bytes[offset + 1] & 0xff) << 16)
                | ((bytes[offset + 2] & 0xff) << 8)
                | (bytes[offset + 3] & 0xff);
    }

    private static String normalizeTextureURL(String value) {
        if (value == null) {
            return null;
        }
        try {
            URI uri = URI.create(value);
            String scheme = uri.getScheme();
            if (("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme))
                    && "textures.minecraft.net".equalsIgnoreCase(uri.getHost())
                    && uri.getPort() == -1 && uri.getUserInfo() == null && uri.getQuery() == null
                    && uri.getFragment() == null && uri.getRawPath() != null
                    && uri.getRawPath().startsWith("/texture/")) {
                return "https://textures.minecraft.net" + uri.getRawPath();
            }
        } catch (IllegalArgumentException ignored) {
            return null;
        }
        return null;
    }

    private static String safeFailure(Exception error) {
        String message = error instanceof IOException ? error.getMessage() : "Skin service could not create skin";
        if (message == null || message.isBlank()) {
            message = "Skin request failed";
        }
        String clean = message.replaceAll("[\\p{Cntrl}]", " ").replaceAll("\\s+", " ").trim();
        return clean.length() <= 160 ? clean : clean.substring(0, 160);
    }

    private record SkinRequest(String username, UUID uuid, String kind, String value, SkinVariant variant) {}
    private record SkinResult(SkinProperty property, SkinIdentifier identifier, String textureURL, String model) {}
    private record SkinResultBody(String status, String textureURL, String model, String error) {}
}
