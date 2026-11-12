package space.inne.hazelwood.auth;

import java.time.Instant;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.server.ServerListPingEvent;

/** Applies the seasonal welcome independently of the remote server-icon service. */
final class SeasonalMotdListener implements Listener {
    @EventHandler(priority = EventPriority.HIGHEST)
    public void onServerListPing(ServerListPingEvent event) {
        event.motd(Component.text(SeasonalMotd.forInstant(Instant.now()), NamedTextColor.GOLD));
    }
}
