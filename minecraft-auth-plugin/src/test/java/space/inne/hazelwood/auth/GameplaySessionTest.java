package space.inne.hazelwood.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class GameplaySessionTest {
    @Test
    void onlyRecordsSessionsThatReachFiveMinutes() {
        GameplaySession session = new GameplaySession(10_000L, "overworld");

        assertFalse(session.qualifies(10_000L + GameplaySession.MIN_DURATION_MILLIS - 1));
        assertTrue(session.qualifies(10_000L + GameplaySession.MIN_DURATION_MILLIS));
    }

    @Test
    void accumulatesTimeDeathsAndUniqueAdvancementsAcrossDimensions() {
        GameplaySession session = new GameplaySession(0L, "overworld");
        session.accrue(60_000L);
        session.changeDimension("nether");
        session.accrue(120_000L);
        session.changeDimension("end");
        session.accrue(180_000L);
        session.recordDeath();
        session.recordDeath();
        session.recordAdvancement("minecraft:story/mine_diamond");
        session.recordAdvancement("minecraft:story/mine_diamond");

        assertEquals(2, session.deaths());
        assertEquals(60L, session.dimensionsSeconds().get("overworld"));
        assertEquals(60L, session.dimensionsSeconds().get("nether"));
        assertEquals(60L, session.dimensionsSeconds().get("end"));
        assertEquals(1, session.advancements().size());
        assertEquals("minecraft:story/mine_diamond", session.advancements().get(0));
    }
}
