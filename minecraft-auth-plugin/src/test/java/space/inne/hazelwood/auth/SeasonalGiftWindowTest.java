package space.inne.hazelwood.auth;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Instant;
import org.junit.jupiter.api.Test;

class SeasonalGiftWindowTest {
    @Test
    void allowsDecemberFirstAndRejectsPreviousDay() {
        assertTrue(SeasonalGiftWindow.allows(Instant.parse("2026-12-01T00:00:00+03:00")));
        assertFalse(SeasonalGiftWindow.allows(Instant.parse("2026-11-30T23:59:59+03:00")));
    }

    @Test
    void allowsJanuarySeventhAndRejectsFollowingDay() {
        assertTrue(SeasonalGiftWindow.allows(Instant.parse("2027-01-07T23:59:59+03:00")));
        assertFalse(SeasonalGiftWindow.allows(Instant.parse("2027-01-08T00:00:00+03:00")));
    }

    @Test
    void usesMoscowDateAcrossUtcBoundary() {
        assertFalse(SeasonalGiftWindow.allows(Instant.parse("2026-11-30T20:59:59Z")));
        assertTrue(SeasonalGiftWindow.allows(Instant.parse("2026-11-30T21:00:00Z")));
    }
}
