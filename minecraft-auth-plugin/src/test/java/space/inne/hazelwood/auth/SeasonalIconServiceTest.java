package space.inne.hazelwood.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;

final class SeasonalIconServiceTest {
    @Test
    void decodesExact64PixelPng() throws IOException {
        BufferedImage decoded = SeasonalIconService.decodeIconPng(png(64, 64));

        assertEquals(64, decoded.getWidth());
        assertEquals(64, decoded.getHeight());
    }

    @Test
    void rejectsPngWithWrongDimensions() throws IOException {
        assertThrows(IOException.class, () -> SeasonalIconService.decodeIconPng(png(63, 64)));
    }

    @Test
    void rejectsInvalidOrOversizedPng() {
        assertThrows(IOException.class, () -> SeasonalIconService.decodeIconPng(new byte[] {1, 2, 3}));
        assertThrows(IOException.class, () -> SeasonalIconService.decodeIconPng(
                new byte[SeasonalIconService.MAX_ICON_BYTES + 1]));
    }

    @Test
    void resolvesFixedEndpointFromPublicPortalOrigin() {
        URI endpoint = SeasonalIconService.endpointFromBaseUri(URI.create("https://hazelwood.inne.space/"));

        assertEquals(URI.create("https://hazelwood.inne.space/api/seasonal-icon"), endpoint);
    }

    @Test
    void rejectsPortalBaseWithCredentialsOrPath() {
        assertThrows(IllegalArgumentException.class,
                () -> SeasonalIconService.endpointFromBaseUri(URI.create("https://user@example.test")));
        assertThrows(IllegalArgumentException.class,
                () -> SeasonalIconService.endpointFromBaseUri(URI.create("https://example.test/portal")));
    }

    private static byte[] png(int width, int height) throws IOException {
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        if (!ImageIO.write(image, "png", output)) {
            throw new IOException("No PNG writer installed");
        }
        return output.toByteArray();
    }
}
