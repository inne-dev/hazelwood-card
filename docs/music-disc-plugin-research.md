# Custom music disc plugin research

Reviewed 2026-10-12 for Hazelwood's Paper 26.3 server and its website-driven disc upload flow.

## Recommendation

Test **CDisc Music** on a staging server as the leading candidate. Its Modrinth listing explicitly includes Minecraft 26.3 and Paper/Purpur/Spigot. It turns local audio files into jukebox discs and provides a player screen with pause, seek, previous/next, repeat-off/repeat-queue/repeat-one, shuffle, and volume controls. Audio is positional and delivered through Simple Voice Chat or Plasmo Voice. Hazelwood already runs the Simple Voice Chat server plugin (`minecraft-server/docker-compose.yml`); every player who wants to hear CDisc also needs the matching client mod.

CDisc's documented local-file workflow accepts files in `plugins/CDisc/local`, and its public API has `CDiscApi.createDisc("local:<filename>")` to create a real disc item. This gives the portal a viable integration path: retain the website upload, make its OGG available to the server in CDisc's local folder, then use the API from HazelwoodAuth to create and give the item. The current portal instead builds a per-disc resource-pack ZIP and asks HazelwoodAuth to create a custom item, so this requires changing that handoff and disabling the old custom-disc playback handler. The CDisc docs do not explicitly promise that vanilla jukebox sound events are suppressed in all cases; verify the exact double-audio symptom with a test client before replacing production behavior.

CDisc can update itself when the server stops; disable that behavior if installed so Hazelwood's startup-managed plugin versions remain pinned.

## Alternatives

| Candidate | Fit | Trade-off |
| --- | --- | --- |
| [CDisc Music](https://modrinth.com/plugin/cdisc-music) | Best match for ordinary discs, site-uploaded local files, repeat modes, volume, and a jukebox GUI; Paper 26.3 is listed. | Requires Simple Voice Chat or Plasmo Voice on both server and clients. Recent project; test its handling of vanilla jukebox sounds before production. |
| [CustomDiscs SVC](https://modrinth.com/plugin/customdiscs-svc) | Local MP3/WAV/FLAC files, positional jukebox audio, Paper 26.3 listed, public API, and higher adoption. | Also requires Simple Voice Chat client mod plus PacketEvents on the server; documented feature set does not show the repeat/player-screen controls requested. Its local file directory and API would also need portal integration. |
| [BS CustomJukebox](https://modrinth.com/plugin/bs-customjukebox) | No client mod; Paper 26.x, custom OGG discs, playlists, loop/repeat-one, personal volume, and an admin GUI. | Still depends on resource-pack sounds, preserving much of the current pack pipeline. Its documentation says pause/resume, seeking, and mid-track volume changes are unsupported. |
| [GMusic](https://modrinth.com/plugin/gmusic) | GUI, volume, and once/shuffle/repeat modes; Paper through 26.3. | Plays note-block song formats (NBS/GNBS), rather than the uploaded MP3/OGG audio file as a conventional jukebox disc. |

## Sources

- CDisc Music, [Modrinth compatibility and feature list](https://modrinth.com/plugin/cdisc-music) and [upstream README/API](https://github.com/valkdzx/CDisc-Music).
- CustomDiscs SVC, [Modrinth page and upstream documentation](https://modrinth.com/plugin/customdiscs-svc).
- BS CustomJukebox, [Modrinth page](https://modrinth.com/plugin/bs-customjukebox) and [upstream README](https://github.com/BoondockSulfur/CustomJukebox/blob/main/README.md).
- GMusic, [Modrinth page](https://modrinth.com/plugin/gmusic).
- Hazelwood integration: `internal/app/music_disc.go`, `minecraft-auth-plugin/src/main/java/space/inne/hazelwood/auth/MusicDiscRequestService.java`, and the sibling server's `docker-compose.yml` / `README.md`.
