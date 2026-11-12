package space.inne.hazelwood.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

final class MusicDiscInteractionTest {
    @Test
    void audioFilenameIsCanonicalAndCannotEscapeCdiscMusicFolder() {
        assertEquals("550e8400-e29b-41d4-a716-446655440000.ogg",
                MusicDiscRequestService.audioFileName("550E8400-E29B-41D4-A716-446655440000"));
        assertThrows(IllegalArgumentException.class,
                () -> MusicDiscRequestService.audioFileName("../../outside.ogg"));
    }
}
