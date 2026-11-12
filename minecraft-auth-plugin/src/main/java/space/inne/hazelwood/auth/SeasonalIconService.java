package space.inne.hazelwood.auth;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.ByteBuffer;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;
import java.util.concurrent.Flow;
import java.util.concurrent.atomic.AtomicBoolean;
import javax.imageio.ImageIO;
import org.bukkit.Bukkit;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.server.ServerListPingEvent;
import org.bukkit.util.CachedServerIcon;
import org.bukkit.plugin.Plugin;

/**
 * Polls the public portal icon and serves its latest PNG on server-list pings.
 *
 * <p>The constructor accepts the public portal origin, for example
 * {@code https://hazelwood.inne.space}. The service resolves the fixed
 * {@code /api/seasonal-icon} route itself.</p>
 */
public final class SeasonalIconService implements Listener {
    static final int ICON_SIZE = 64;
    static final int MAX_ICON_BYTES = 256 * 1024;
    private static final long POLL_INTERVAL_TICKS = 20L * 60L * 5L;
    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(2);
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(6);
    private static final byte[] PNG_SIGNATURE = {
            (byte) 0x89, 'P', 'N', 'G', 0x0d, 0x0a, 0x1a, 0x0a
    };
    private static final URI ICON_PATH = URI.create("/api/seasonal-icon");

    private final Plugin plugin;
    private final URI endpoint;
    private final HttpClient httpClient;
    private final AtomicBoolean started = new AtomicBoolean();

    private volatile CachedServerIcon currentIcon;
    private volatile byte[] currentBytes;
    private volatile boolean fetchFailureLogged;

    public SeasonalIconService(Plugin plugin, URI portalBaseUri) {
        this.plugin = Objects.requireNonNull(plugin, "plugin");
        this.endpoint = endpointFromBaseUri(portalBaseUri);
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(CONNECT_TIMEOUT)
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();
    }

    /** Registers the ping listener and starts periodic asynchronous polling. */
    public void start() {
        if (!started.compareAndSet(false, true)) {
            return;
        }

        Bukkit.getPluginManager().registerEvents(this, plugin);
        plugin.getServer().getScheduler().runTaskTimerAsynchronously(
                plugin, this::pollSafely, 1L, POLL_INTERVAL_TICKS);
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onServerListPing(ServerListPingEvent event) {
        CachedServerIcon icon = currentIcon;
        if (icon != null) {
            // PaperServerListPingEvent extends ServerListPingEvent and overrides this setter.
            event.setServerIcon(icon);
        }
    }

    private void pollSafely() {
        if (!plugin.isEnabled()) {
            return;
        }

        try {
            HttpRequest request = HttpRequest.newBuilder(endpoint)
                    .timeout(REQUEST_TIMEOUT)
                    .header("Accept", "image/png")
                    .header("Cache-Control", "no-cache")
                    .header("Pragma", "no-cache")
                    .GET()
                    .build();
            HttpResponse<byte[]> response = httpClient.send(request,
                    info -> new LimitedBodySubscriber(MAX_ICON_BYTES));

            if (response.statusCode() != 200) {
                throw new IOException("Seasonal icon endpoint returned HTTP " + response.statusCode());
            }
            if (!isPngContentType(response.headers().firstValue("Content-Type").orElse(""))) {
                throw new IOException("Seasonal icon endpoint did not return image/png");
            }
            if (response.headers().firstValueAsLong("Content-Length").orElse(-1L) > MAX_ICON_BYTES) {
                throw new IOException("Seasonal icon response is too large");
            }

            byte[] bytes = response.body();
            byte[] loadedBytes = currentBytes;
            if (Arrays.equals(loadedBytes, bytes)) {
                fetchFailureLogged = false;
                return;
            }

            BufferedImage image = decodeIconPng(bytes);
            plugin.getServer().getScheduler().runTask(plugin, () -> publishIcon(bytes, image));
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            logFetchFailure(error);
        } catch (Exception error) {
            logFetchFailure(error);
        }
    }

    private void publishIcon(byte[] bytes, BufferedImage image) {
        if (!plugin.isEnabled() || Arrays.equals(currentBytes, bytes)) {
            return;
        }

        try {
            CachedServerIcon icon = plugin.getServer().loadServerIcon(image);
            currentIcon = icon;
            currentBytes = bytes.clone();
            fetchFailureLogged = false;
        } catch (Exception error) {
            logFetchFailure(error);
        }
    }

    private void logFetchFailure(Exception error) {
        if (!fetchFailureLogged && plugin.isEnabled()) {
            plugin.getLogger().warning("Seasonal server icon unavailable (" + error.getClass().getSimpleName() + ").");
            fetchFailureLogged = true;
        }
    }

    static URI endpointFromBaseUri(URI portalBaseUri) {
        Objects.requireNonNull(portalBaseUri, "portalBaseUri");
        String scheme = portalBaseUri.getScheme();
        if (!portalBaseUri.isAbsolute()
                || scheme == null
                || !(scheme.equalsIgnoreCase("http") || scheme.equalsIgnoreCase("https"))
                || portalBaseUri.getHost() == null
                || portalBaseUri.getUserInfo() != null
                || portalBaseUri.getQuery() != null
                || portalBaseUri.getFragment() != null
                || (portalBaseUri.getPath() != null
                    && !portalBaseUri.getPath().isEmpty()
                    && !portalBaseUri.getPath().equals("/"))) {
            throw new IllegalArgumentException("Portal URL must be an HTTP(S) origin without credentials, path, query, or fragment");
        }
        return portalBaseUri.resolve(ICON_PATH);
    }

    static BufferedImage decodeIconPng(byte[] bytes) throws IOException {
        if (bytes == null || bytes.length == 0 || bytes.length > MAX_ICON_BYTES) {
            throw new IOException("Seasonal icon PNG has invalid size");
        }
        if (bytes.length < 24
                || !hasPngSignature(bytes)
                || readInt(bytes, 8) != 13
                || !matches(bytes, 12, "IHDR")) {
            throw new IOException("Seasonal icon response is not a PNG with an IHDR header");
        }

        int width = readInt(bytes, 16);
        int height = readInt(bytes, 20);
        if (width != ICON_SIZE || height != ICON_SIZE) {
            throw new IOException("Seasonal icon PNG must be exactly 64x64 pixels");
        }

        BufferedImage image = ImageIO.read(new ByteArrayInputStream(bytes));
        if (image == null || image.getWidth() != ICON_SIZE || image.getHeight() != ICON_SIZE) {
            throw new IOException("Seasonal icon PNG could not be decoded as a 64x64 image");
        }
        return image;
    }

    private static boolean hasPngSignature(byte[] bytes) {
        for (int index = 0; index < PNG_SIGNATURE.length; index++) {
            if (bytes[index] != PNG_SIGNATURE[index]) {
                return false;
            }
        }
        return true;
    }

    private static boolean matches(byte[] bytes, int offset, String expected) {
        for (int index = 0; index < expected.length(); index++) {
            if (bytes[offset + index] != (byte) expected.charAt(index)) {
                return false;
            }
        }
        return true;
    }

    private static int readInt(byte[] bytes, int offset) {
        return ((bytes[offset] & 0xff) << 24)
                | ((bytes[offset + 1] & 0xff) << 16)
                | ((bytes[offset + 2] & 0xff) << 8)
                | (bytes[offset + 3] & 0xff);
    }

    private static boolean isPngContentType(String contentType) {
        int separator = contentType.indexOf(';');
        String mediaType = (separator >= 0 ? contentType.substring(0, separator) : contentType).trim();
        return mediaType.toLowerCase(Locale.ROOT).equals("image/png");
    }

    private static final class LimitedBodySubscriber implements HttpResponse.BodySubscriber<byte[]> {
        private final int maxBytes;
        private final ByteArrayOutputStream output = new ByteArrayOutputStream();
        private final CompletableFuture<byte[]> body = new CompletableFuture<>();
        private Flow.Subscription subscription;

        private LimitedBodySubscriber(int maxBytes) {
            this.maxBytes = maxBytes;
        }

        @Override
        public CompletionStage<byte[]> getBody() {
            return body;
        }

        @Override
        public void onSubscribe(Flow.Subscription subscription) {
            if (this.subscription != null) {
                subscription.cancel();
                return;
            }
            this.subscription = subscription;
            subscription.request(1);
        }

        @Override
        public void onNext(List<ByteBuffer> buffers) {
            for (ByteBuffer buffer : buffers) {
                int remaining = buffer.remaining();
                if ((long) output.size() + remaining > maxBytes) {
                    subscription.cancel();
                    body.completeExceptionally(new IOException("Seasonal icon response is too large"));
                    return;
                }
                byte[] chunk = new byte[remaining];
                buffer.get(chunk);
                output.write(chunk, 0, chunk.length);
            }
            subscription.request(1);
        }

        @Override
        public void onError(Throwable error) {
            body.completeExceptionally(error);
        }

        @Override
        public void onComplete() {
            body.complete(output.toByteArray());
        }
    }
}
