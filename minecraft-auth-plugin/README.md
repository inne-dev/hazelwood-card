# HazelwoodAuth

Paper 26.3 plugin that uses the Hazelwood website account and password for server login.

- The plugin checks registration and bans before allowing a connection.
- Registered players use `/login` on each connection to open the Minecraft password dialog. The plugin passes the entered password to the existing website account check and does not log or persist it.
- Password arguments are rejected: never enter a password as `/login <password>`.
- `/register` points to the website; passwords are never created in Minecraft.
- Gameplay stays locked until the website confirms the password.
- Authentication requests use the private Docker network and a shared Docker secret.
- After successful `/login`, the plugin tracks a gameplay session. Sessions under five minutes are omitted; longer sessions are written as one history item with duration, deaths, dimension time, and earned advancements.
- If SkinsRestorer 15.12.6 is installed, successful `/login` applies the skin resolved from the player's Minecraft name when no saved SkinsRestorer selection exists. Saved selections remain active, and portal `hwskin <requestId>` requests can set or replace them through the public API.
- Players cannot use `/skin`, `/skins`, `/sr`, or `/skinsrestorer` in game; skin changes go through the Hazelwood website.
- The server runs with `online-mode=false`, so the default skin is looked up by Minecraft name. Hazelwood password authentication binds that name to the website account, but the Minecraft connection does not prove Mojang account ownership.

## Configuration

Set `MINECRAFT_AUTH_URL` to the portal's internal URL. It defaults to `http://hazelwood-card:8080/internal/minecraft/auth`.
Mount the same `minecraft_auth_secret` Docker secret in the portal and Minecraft containers at `/run/secrets/minecraft_auth_secret`.

The Minecraft server's `spigot.yml` should set `commands.log: false` to keep any accidentally entered legacy `/login <password>` command out of server logs.

## Portal profile exports

The plugin atomically writes `portal/catalog.json` and `portal/profiles/<UUID>.json` under the HazelwoodAuth plugin data directory. Tracking begins after a successful website password check. Dimension playtime is collected from that point forward; previous Minecraft totals cannot be split by dimension reliably. Each qualifying gameplay session is saved when the player disconnects or the plugin shuts down.

The portal must mount the server directory containing `plugins/HazelwoodAuth/portal` as read-only. The `hwskin <requestId>` command accepts calls from the Minecraft console or RCON console only. It fetches the pending portal request over the existing internal HTTP service and reports the result back through the same private network and shared secret.

SkinsRestorer is an optional integration. The compile-time API dependency is not bundled in HazelwoodAuth; the server must provide SkinsRestorer 15.12.6 at runtime. Skin search and upload generation run asynchronously, while applying a skin to an online player runs on the server thread. Existing saved selections are preserved during rollout because SkinsRestorer does not record whether they came from the website or an older in-game command.

## Music discs

CDisc Music is a required runtime dependency. Music uploaded in the Hazelwood profile is converted to OGG, fetched through the authenticated portal endpoint after the recipient logs in, stored in CDisc's `local` audio directory, and turned into a CDisc item through its API. Players need the Simple Voice Chat client mod to hear tracks. Use the CDisc jukebox player controls for repeat, queue, seeking, and volume.

## Build

Build the `HazelwoodAuth.jar` artifact with Gradle and Java 25. Paper API is compile-only; it is supplied by the Minecraft server at runtime.
## Seasonal server-list icon

HazelwoodAuth reads the current 64×64 icon from `${HAZELWOOD_PORTAL_ORIGIN}/api/seasonal-icon` every five minutes and serves it in Minecraft server-list pings. If unset, it uses `https://hazelwood-card.inne.space`. When the Minecraft container shares the portal's private Docker network, set `HAZELWOOD_PORTAL_ORIGIN` to `http://hazelwood-card:8080` so it can fetch the icon from that portal.

Edit the portal's `web/assets/brand/seasonal-icons.json` to change recurring UTC dates; the same schedule drives the browser favicon. After a scheduled boundary, the plugin picks up the new icon on its next poll. Minecraft clients show it on their next server-list ping; use Refresh in Multiplayer to request one immediately.

The server-list MOTD is Russian: it uses a warm welcome by default, the portal's Halloween dates (October 24–November 2 UTC), and a lightly animated New Year greeting from December 14 through January 7 UTC. The New Year MOTD starts before the icon's December 24 window.
