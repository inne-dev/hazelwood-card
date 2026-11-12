# Hazelwood client pack

This is a staging area for the future client build. No client archive, mod list, version lock, or keybind preset has been selected yet. Server plugins are not proof that a matching client mod is installed or bundled.

Put future Linux, macOS, and Windows downloads in `downloads/<platform>/`. Keep the file names and SHA-256 checksums in `manifest.json`. Add a mod only after confirming its exact release supports Minecraft 26.3 and the server. Record the tested default and recommended key for each feature in `manifest.json`; never assume a key from the server-side plugin alone.

`manifest.json` is the machine-readable schema/template. The `mods`, `configs`, and `keybindings` lists are intentionally empty until a client pack is selected and tested.
