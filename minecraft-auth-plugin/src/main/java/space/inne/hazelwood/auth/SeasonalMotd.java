package space.inne.hazelwood.auth;

import java.time.Instant;
import java.time.LocalDate;
import java.time.MonthDay;
import java.time.ZoneOffset;
import java.util.Objects;

/** Builds the Russian server-list message for the current UTC season. */
final class SeasonalMotd {
    static final String STANDARD_MESSAGE =
            "Добро пожаловать!";
    static final String HALLOWEEN_MESSAGE =
            "🎃 С Хэллоуином! • Сладость или гадость!";

    private static final MonthDay HALLOWEEN_START = MonthDay.of(10, 24);
    private static final MonthDay HALLOWEEN_END = MonthDay.of(11, 2);
    private static final MonthDay NEW_YEAR_START = MonthDay.of(12, 14);
    private static final MonthDay NEW_YEAR_END = MonthDay.of(1, 7);
    private static final String[] NEW_YEAR_ACCENTS = {"✦", "❄", "✧"};

    private SeasonalMotd() {
    }

    static String forInstant(Instant instant) {
        Objects.requireNonNull(instant, "instant");
        long animationStep = Math.floorDiv(instant.getEpochSecond(), 2L);
        int frame = (int) Math.floorMod(animationStep, NEW_YEAR_ACCENTS.length);
        return forDate(instant.atZone(ZoneOffset.UTC).toLocalDate(), frame);
    }

    static String forDate(LocalDate date, int animationFrame) {
        Objects.requireNonNull(date, "date");
        MonthDay current = MonthDay.from(date);

        if (isWithin(current, NEW_YEAR_START, NEW_YEAR_END)) {
            String accent = NEW_YEAR_ACCENTS[Math.floorMod(animationFrame, NEW_YEAR_ACCENTS.length)];
            return accent + " С Новым годом! • Тепла, радости и чудес! " + accent;
        }
        if (isWithin(current, HALLOWEEN_START, HALLOWEEN_END)) {
            return HALLOWEEN_MESSAGE;
        }
        return STANDARD_MESSAGE;
    }

    private static boolean isWithin(MonthDay current, MonthDay start, MonthDay end) {
        if (start.compareTo(end) <= 0) {
            return current.compareTo(start) >= 0 && current.compareTo(end) <= 0;
        }
        return current.compareTo(start) >= 0 || current.compareTo(end) <= 0;
    }
}
