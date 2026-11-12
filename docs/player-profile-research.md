# Minecraft profile telemetry and skin API notes

## Current integration

HazelwoodAuth authenticates each player with `POST /internal/minecraft/auth`. Its `finishLogin` method marks a player authenticated only after the portal confirms registration, no ban, and a valid password. Profile tracking therefore starts at that successful transition, not at `PlayerJoinEvent`, which also fires for players who have not authenticated.

The plugin currently has no JSON library. Profile files can stay self-contained with a small JSON encoder and atomic temp-file replacement. Store them in HazelwoodAuth's plugin data folder under `portal/profiles/<uuid>.json`, with `portal/catalog.json` beside the `profiles` directory.

The Minecraft server binds `./data` to `/data`; HazelwoodAuth's plugin directory is therefore under `data/plugins/HazelwoodAuth`. The portal's current Compose file does not mount this server data directory. To read exports, the portal needs a read-only mount for `../minecraft-server/data/plugins/HazelwoodAuth/portal` at `/minecraft-data/plugins/HazelwoodAuth/portal` (or the equivalent mount path used by the backend).

The installed SkinsRestorer plugin reports version `15.12.6` in its local `plugin.yml`. Its public API guide pins `net.skinsrestorer:skinsrestorer-api:15.12.6`, says to use `compileOnly`, and warns to keep skin lookup and generation off the server thread. Persistent skin selection uses `SkinStorage.findOrCreateSkinData`, saves the returned identifier through `PlayerStorage.setSkinIdOfPlayer`, then applies the already resolved property with the platform skin applier. The installed API supports `MineSkinAPI.genSkin(byte[], SkinVariant)` for an in-memory PNG upload; its result supplies a signed property. A custom entry can be saved with `SkinStorage.setCustomSkinData` and linked with `SkinIdentifier.ofCustom`. See the official [API lifecycle](https://skinsrestorer.net/docs/development/api), [persistent storage guide](https://skinsrestorer.net/docs/development/storage), [SkinStorage Javadocs](https://jd.skinsrestorer.net/net/skinsrestorer/api/storage/SkinStorage.html), [MineSkinAPI Javadocs](https://jd.skinsrestorer.net/net/skinsrestorer/api/connections/MineSkinAPI.html), and [SkinIdentifier Javadocs](https://jd.skinsrestorer.net/net/skinsrestorer/api/property/SkinIdentifier.html).

## Paper API findings

Paper 26.3 exposes `PlayerAdvancementDoneEvent`, called when a player completes all criteria for an advancement. `Bukkit.advancementIterator()` enumerates the current catalog. In current Paper API, `Advancement.getDisplay()` may be null for hidden advancements such as recipes, so exporting only entries with a display excludes recipe unlocks. The public API supports display titles and descriptions as Adventure components. Plain text serialization produces readable text components; when a value is translatable, its key can be exported for portal-side localization. Sources: [Paper 26.3 player events](https://jd.papermc.io/paper/26.3/org/bukkit/event/player/package-summary.html), [Paper 26.3 API index](https://jd.papermc.io/paper/26.3/index-all.html), and [Paper 26.3 Advancement Javadocs](https://jd.papermc.io/paper/26.3/org/bukkit/advancement/Advancement.html).

Paper's `World.Environment` distinguishes `NORMAL`, `NETHER`, and `THE_END`. Count elapsed authenticated wall-clock time by the player's current world environment, not vanilla playtime statistics, so legacy playtime cannot be incorrectly assigned to a dimension. This collection has no trustworthy pre-install dimension history; publish an explicit `trackingSince` date and only accumulate future sessions. Source: [Bukkit World.Environment](https://jd.papermc.io/paper/1.19.4/org/bukkit/World.Environment.html).

## Skin request contract

The portal backend confirms it will make `profiles/<UUID>.json` and `catalog.json` available from the mount above. Skin jobs arrive through RCON as `hwskin <requestId>`. SkinsRestorer may return an `http` texture URL; the portal requires HTTPS, so normalize the scheme and accept only `textures.minecraft.net/texture/...`. The plugin should issue:

- `GET /internal/minecraft/skin-requests/{id}` with `Authorization: Bearer <minecraft_auth_secret>` and accept `{username,uuid,kind,value,model}` where `kind` is `player` or `upload`.
- `POST /internal/minecraft/skin-requests/{id}/result` with the same authorization and `{status,textureURL,model,error?}`.

For `player`, `value` is a Minecraft account name. For `upload`, `value` is base64-encoded PNG data and `model` is `classic` or `slim`. Validate image bytes, size, UUID, enum values, and request ID before calling SkinsRestorer. Keep the RCON command console-only; do not register it as a player command. The portal owns pending-request status and maps non-success RCON replies to request failure.

## Sources

- SkinsRestorer, [Dependencies and API lifecycle](https://skinsrestorer.net/docs/development/api), version 15.12.6, reviewed 2026-10-01.
- SkinsRestorer, [Persistent and temporary skin changes](https://skinsrestorer.net/docs/development/storage), version 15.12.6, reviewed 2026-10-01.
- SkinsRestorer API, [SkinStorage Javadocs](https://jd.skinsrestorer.net/net/skinsrestorer/api/storage/SkinStorage.html), [PlayerStorage Javadocs](https://jd.skinsrestorer.net/net/skinsrestorer/api/storage/PlayerStorage.html), [MineSkinAPI Javadocs](https://jd.skinsrestorer.net/net/skinsrestorer/api/connections/MineSkinAPI.html), and [SkinIdentifier Javadocs](https://jd.skinsrestorer.net/net/skinsrestorer/api/property/SkinIdentifier.html).
- PaperMC, [Paper 26.3 player event package](https://jd.papermc.io/paper/26.3/org/bukkit/event/player/package-summary.html) and [Paper 26.3 API index](https://jd.papermc.io/paper/26.3/index-all.html).
- PaperMC, [Paper 26.3 Advancement Javadocs](https://jd.papermc.io/paper/26.3/org/bukkit/advancement/Advancement.html) and [World.Environment Javadocs](https://jd.papermc.io/paper/1.19.4/org/bukkit/World.Environment.html).
- Local primary files: `minecraft-auth-plugin/src/main/java/space/inne/hazelwood/auth/HazelwoodAuth.java`, `minecraft-auth-plugin/build.gradle.kts`, `/Users/andy/Projects/minecraft-server/data/plugins/SkinsRestorer.jar` metadata, and both Compose files.
