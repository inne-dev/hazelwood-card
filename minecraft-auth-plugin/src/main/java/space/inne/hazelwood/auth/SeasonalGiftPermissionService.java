package space.inne.hazelwood.auth;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.CompletionException;
import net.luckperms.api.LuckPerms;
import net.luckperms.api.LuckPermsProvider;
import net.luckperms.api.model.group.Group;
import net.luckperms.api.model.data.NodeMap;
import net.luckperms.api.node.NodeType;
import net.luckperms.api.node.types.PermissionNode;
import org.bukkit.Bukkit;
import org.bukkit.plugin.java.JavaPlugin;

final class SeasonalGiftPermissionService {
    private static final String DEFAULT_GROUP = "default";
    private static final String CREATE_PERMISSION = "playerpresents.create";
    private static final long CHECK_PERIOD_TICKS = 20L * 60L;

    private final JavaPlugin plugin;
    private final LuckPerms luckPerms;
    private int taskId = -1;
    private boolean ready;

    SeasonalGiftPermissionService(JavaPlugin plugin) {
        this.plugin = plugin;
        this.luckPerms = LuckPermsProvider.get();
    }

    void start() {
        updatePermission();
        taskId = Bukkit.getScheduler()
                .runTaskTimer(plugin, this::updatePermission, CHECK_PERIOD_TICKS, CHECK_PERIOD_TICKS)
                .getTaskId();
    }

    void stop() {
        if (taskId >= 0) {
            Bukkit.getScheduler().cancelTask(taskId);
            taskId = -1;
        }
    }

    boolean isReady() {
        return ready;
    }

    private void updatePermission() {
        try {
            updatePermissionSafely();
        } catch (LinkageError | RuntimeException error) {
            ready = false;
            plugin.getLogger().warning("LuckPerms seasonal gift permission update failed ("
                    + error.getClass().getSimpleName() + "); command fallback will enforce the date window.");
        }
    }

    private void updatePermissionSafely() {
        boolean allowed = SeasonalGiftWindow.allows(Instant.now());
        Group group = luckPerms.getGroupManager().getGroup(DEFAULT_GROUP);
        if (group == null) {
            ready = false;
            plugin.getLogger().warning("LuckPerms default group is unavailable; PlayerPresents gift creation permission was not updated.");
            return;
        }

        List<PermissionNode> normalNodes = permissionNodes(group.data());
        List<PermissionNode> transientNodes = permissionNodes(group.transientData());
        if (normalNodes.size() == 1
                && transientNodes.isEmpty()
                && normalNodes.get(0).getValue() == allowed
                && normalNodes.get(0).getContexts().isEmpty()
                && !normalNodes.get(0).hasExpiry()) {
            ready = true;
            return;
        }

        normalNodes.forEach(group.data()::remove);
        transientNodes.forEach(group.transientData()::remove);
        group.data().add(PermissionNode.builder(CREATE_PERMISSION).value(allowed).build());
        ready = true;

        luckPerms.getGroupManager().saveGroup(group).whenComplete((ignored, error) -> {
            if (error != null) {
                Throwable cause = error instanceof CompletionException && error.getCause() != null
                        ? error.getCause()
                        : error;
                plugin.getLogger().warning("Could not save the seasonal PlayerPresents permission to LuckPerms ("
                        + cause.getClass().getSimpleName() + ").");
            }
        });
        plugin.getLogger().info("PlayerPresents gift creation is "
                + (allowed ? "enabled" : "disabled") + " for the default group.");
    }

    private static List<PermissionNode> permissionNodes(NodeMap nodes) {
        return nodes.toCollection().stream()
                .filter(NodeType.PERMISSION::matches)
                .map(NodeType.PERMISSION::cast)
                .filter(node -> CREATE_PERMISSION.equals(node.getPermission()))
                .toList();
    }
}
