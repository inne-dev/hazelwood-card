package space.inne.hazelwood.auth;

import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

final class GameplaySession {
    static final long MIN_DURATION_MILLIS = 5 * 60 * 1000L;

    private final long startedAt;
    private long lastAccruedAt;
    private String dimension;
    private int deaths;
    private final Map<String, Long> dimensionMillis = new LinkedHashMap<>();
    private final Set<String> advancements = new LinkedHashSet<>();

    GameplaySession(long startedAt, String dimension) {
        this.startedAt = startedAt;
        this.lastAccruedAt = startedAt;
        this.dimension = dimension;
    }

    long startedAt() {
        return startedAt;
    }

    String dimension() {
        return dimension;
    }

    void changeDimension(String dimension) {
        this.dimension = dimension;
    }

    long accrue(long now) {
        long elapsed = Math.max(0, now - lastAccruedAt);
        if (dimension != null) {
            dimensionMillis.merge(dimension, elapsed, Long::sum);
        }
        lastAccruedAt = Math.max(lastAccruedAt, now);
        return elapsed;
    }

    boolean qualifies(long now) {
        return now - startedAt >= MIN_DURATION_MILLIS;
    }

    long durationSeconds(long now) {
        return Math.max(0, now - startedAt) / 1000L;
    }

    void recordDeath() {
        deaths++;
    }

    int deaths() {
        return deaths;
    }

    void recordAdvancement(String advancementId) {
        if (advancementId != null && !advancementId.isBlank()) {
            advancements.add(advancementId);
        }
    }

    List<String> advancements() {
        return List.copyOf(advancements);
    }

    Map<String, Long> dimensionsSeconds() {
        Map<String, Long> seconds = new LinkedHashMap<>();
        seconds.put("overworld", dimensionMillis.getOrDefault("overworld", 0L) / 1000L);
        seconds.put("nether", dimensionMillis.getOrDefault("nether", 0L) / 1000L);
        seconds.put("end", dimensionMillis.getOrDefault("end", 0L) / 1000L);
        return seconds;
    }
}
