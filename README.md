# Hazelwood player portal

Player portal for the Hazelwood Minecraft server. It shows server presence, player profiles and activity, the cached BlueMap world, and account administration.

## Stack

- Go HTTP server and SQLite for a small single-container deployment.
- Plain HTML, CSS, and JavaScript. No frontend build step or remote assets.
- Paper RCON for the cached player list, whitelist updates, and bans.
- BlueMap for the angled 3D map. Map tiles stay on the Minecraft server's persistent data volume.

## Local setup

1. Copy `.env.example` to `.env` and set a unique password for the first admin.
2. Create `~/Projects/minecraft-server/secrets/rcon_password` with a long random value and set its permissions to `600`.
3. Create `~/Projects/minecraft-server/secrets/minecraft_auth_secret` with a separate long random value and set its permissions to `600`. Compose mounts the same file into the portal and Minecraft containers; keep its contents out of `.env` and source control.
4. Build `minecraft-auth-plugin` with Java 25 and Gradle, then copy `build/libs/HazelwoodAuth.jar` into `~/Projects/minecraft-server/data/plugins/`.
5. Start the Minecraft server from `~/Projects/minecraft-server`; its Compose file creates the private `hazelwood-private` network and mounts the auth secret for HazelwoodAuth.
6. Start the portal here with `docker compose up -d --build`.
7. Open `http://127.0.0.1:8080`.

RCON uses port `25575` and BlueMap uses port `8100`. Neither port is published to the host; the portal reaches both over the private Docker network.
The portal mounts `../minecraft-server/data` read-only at `/minecraft-data` to read player stats, advancements, the server user cache, and HazelwoodAuth profile exports. Set `MINECRAFT_DATA_DIR` when running the portal outside Compose. The public connection address is `MINECRAFT_SERVER_ADDRESS`, defaulting to `hazelwood.inne.space`.

## Player profiles

Profile APIs require the `hw_session` account cookie. `GET /api/players` returns portal accounts, names in Minecraft's `usercache.json`, and players in the current server status. `GET /api/players/{username}/details` combines vanilla stats and advancements with HazelwoodAuth's `plugins/HazelwoodAuth/portal` exports. Vanilla play time is stored in ticks and returned in seconds. A JSON `null` means its source file or field is unavailable. Dimension time and session history start when HazelwoodAuth begins recording them; vanilla stats and earned advancements may include earlier play.

Players can submit a skin with `POST /api/me/skin` as multipart field `skin` (PNG, 64×64 or 64×32, at most 256 KB), or choose another Minecraft player's skin with JSON `{ "playerName": "Name", "model": "classic" }`. The API returns `requestId` only after RCON confirms the command was accepted. `GET /api/me/skin/requests/{id}` returns `pending`, `completed`, or `failed`. HazelwoodAuth fetches the request through the secret-protected internal API and posts its result. Skin images are proxied only from `textures.minecraft.net`.

Players can create music discs for themselves by uploading an OGG Vorbis or MP3 file (up to 8 MiB) and naming the disc. MP3 files must be five minutes or shorter; the portal converts them to OGG Vorbis with FFmpeg before creating the resource pack. Conversion is serialized to one process, uses one FFmpeg thread, and has a 90-second timeout to fit the small server container. Temporary source and converted files are removed after each request. The player must accept the resource pack in Minecraft.

## Domain

Add `deploy/Caddyfile` to the existing Caddy setup. Caddy serves the portal at `https://hazelwood-card.inne.space`; `/map/` is proxied by the portal to BlueMap. Point the domain to the Caddy host before enabling the site publicly.

## Server map

BlueMap stores rendered map tiles on disk and updates changed chunks. Its default perspective mode provides the requested angled view. Set rendering to one thread and only render explored chunks to limit CPU and disk use. First render after installation can take time; it is incremental afterward.

## Notes

- The portal includes administrative invite and ban tools.
- The Minecraft plugin checks accounts with `POST /internal/minecraft/auth` and `Authorization: Bearer <secret>`. A request with only `username` returns `registered` and `banned`; including `password` also returns `passwordValid`.
- The server currently runs in offline mode. HazelwoodAuth requires a website account and its password each session; it does not verify ownership of a Mojang account.
- Use `/login` to open the Paper password dialog; `/login <password>` is rejected. HazelwoodAuth passes the dialog value to the existing website check without logging or persisting it. Keep `commands.log: false` in the server's `spigot.yml` so accidentally typed legacy commands are not written to `latest.log`.
- PaperMC's current 26.3 builds are in its beta channel. Keep the pre-upgrade archive until the server has been checked in-game.
- Read [server research](docs/server-research.md) for compatibility, rendering, and migration sources.
