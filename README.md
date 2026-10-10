# Hazelwood player portal

Invite-only profiles for the Hazelwood Minecraft server. The portal shows server presence, serves the cached BlueMap world, and gives admins one-use invitations and player bans.

## Stack

- Go HTTP server and SQLite for a small single-container deployment.
- Plain HTML, CSS, and JavaScript. No frontend build step or remote assets.
- Paper RCON for the cached player list, whitelist updates, and bans.
- BlueMap for the angled 3D map. Map tiles stay on the Minecraft server's persistent data volume.

## Local setup

1. Copy `.env.example` to `.env` and set a unique password for the first admin.
2. Create `~/Projects/minecraft-server/secrets/rcon_password` with a long random value and set its permissions to `600`.
3. Start the Minecraft server from `~/Projects/minecraft-server`; its Compose file creates the private `hazelwood-private` network.
4. Start the portal here with `docker compose up -d --build`.
5. Open `http://127.0.0.1:8080`.

RCON uses port `25575` and BlueMap uses port `8100`. Neither port is published to the host; the portal reaches both over the private Docker network.

## Domain

Add `deploy/Caddyfile` to the existing Caddy setup. Caddy serves the portal at `https://hazelwood-card.inne.space`; `/map/` is proxied by the portal to BlueMap. Point the domain to the Caddy host before enabling the site publicly.

## Server map

BlueMap stores rendered map tiles on disk and updates changed chunks. Its default perspective mode provides the requested angled view. Set rendering to one thread and only render explored chunks to limit CPU and disk use. First render after installation can take time; it is incremental afterward.

## Notes

- The invitation is consumed in the same transaction that creates a player account.
- Registration asks for nickname, password, and the one-use invitation code. No email or other profile fields are collected.
- The server currently runs in offline mode. The website nickname is not proof of Minecraft account ownership; keep the server's in-game login protection enabled.
- PaperMC's current 26.3 builds are in its beta channel. Keep the pre-upgrade archive until the server has been checked in-game.
- Read [server research](docs/server-research.md) for compatibility, rendering, and migration sources.
