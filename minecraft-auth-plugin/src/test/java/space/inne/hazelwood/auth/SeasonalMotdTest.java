package space.inne.hazelwood.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import java.time.Instant;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

final class SeasonalMotdTest {
    @Test
    void usesWarmStandardMessageOutsideSeasonalWindows() {
        assertEquals(SeasonalMotd.STANDARD_MESSAGE,
                SeasonalMotd.forDate(LocalDate.of(2026, 6, 15), 0));
    }

    @Test
    void selectsHalloweenGreetingForInclusivePortalScheduleDates() {
        assertEquals(SeasonalMotd.HALLOWEEN_MESSAGE,
                SeasonalMotd.forDate(LocalDate.of(2026, 10, 24), 0));
        assertEquals(SeasonalMotd.HALLOWEEN_MESSAGE,
                SeasonalMotd.forDate(LocalDate.of(2026, 11, 2), 0));
        assertEquals(SeasonalMotd.STANDARD_MESSAGE,
                SeasonalMotd.forDate(LocalDate.of(2026, 10, 23), 0));
        assertEquals(SeasonalMotd.STANDARD_MESSAGE,
                SeasonalMotd.forDate(LocalDate.of(2026, 11, 3), 0));
    }

    @Test
    void selectsNewYearGreetingFromDecemberFourteenthThroughJanuarySeventh() {
        assertEquals("✦ С Новым годом! • Тепла, радости и чудес! ✦",
                SeasonalMotd.forDate(LocalDate.of(2026, 12, 14), 0));
        assertEquals("✦ С Новым годом! • Тепла, радости и чудес! ✦",
                SeasonalMotd.forDate(LocalDate.of(2027, 1, 7), 0));
        assertEquals(SeasonalMotd.STANDARD_MESSAGE,
                SeasonalMotd.forDate(LocalDate.of(2026, 12, 13), 0));
        assertEquals(SeasonalMotd.STANDARD_MESSAGE,
                SeasonalMotd.forDate(LocalDate.of(2027, 1, 8), 0));
    }

    @Test
    void rotatesNewYearAccentAndUsesUtcDate() {
        LocalDate newYearDate = LocalDate.of(2026, 12, 20);
        assertNotEquals(SeasonalMotd.forDate(newYearDate, 0), SeasonalMotd.forDate(newYearDate, 1));
        assertEquals(SeasonalMotd.STANDARD_MESSAGE,
                SeasonalMotd.forInstant(Instant.parse("2026-12-13T23:59:59Z")));
        assertEquals("✦ С Новым годом! • Тепла, радости и чудес! ✦",
                SeasonalMotd.forInstant(Instant.parse("2026-12-14T00:00:00Z")));
    }
}
