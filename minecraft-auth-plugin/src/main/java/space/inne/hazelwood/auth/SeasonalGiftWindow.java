package space.inne.hazelwood.auth;

import java.time.Instant;
import java.time.MonthDay;
import java.time.ZoneId;

final class SeasonalGiftWindow {
    private static final ZoneId ZONE = ZoneId.of("Europe/Moscow");
    private static final MonthDay START = MonthDay.of(12, 1);
    private static final MonthDay END = MonthDay.of(1, 7);

    private SeasonalGiftWindow() {
    }

    static boolean allows(Instant instant) {
        MonthDay date = MonthDay.from(instant.atZone(ZONE));
        return !date.isBefore(START) || !date.isAfter(END);
    }
}
