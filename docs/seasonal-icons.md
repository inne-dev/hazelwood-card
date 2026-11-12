# Seasonal server and website icons

The site and Minecraft server list use the same dated PNG from `web/assets/brand`. The public `/api/seasonal-icon` endpoint selects it, so a schedule change applies to both surfaces automatically. The Minecraft plugin checks for a changed icon every five minutes.

Edit `web/assets/brand/seasonal-icons.json` to change the recurring annual schedule. Dates use `MM-DD`, are inclusive, and follow UTC. A range may cross New Year, as the winter range does. Every range must last at least the configured `minimumDisplayDays` (currently 7). When ranges overlap, the rule with the higher `priority` wins.

The current windows are:

- Autumn: September 1–November 23
- Halloween: October 24–November 2
- Winter: November 24–February 14
- New Year: December 24–January 7

Keep each icon as a transparent 64×64 PNG next to the schedule file. The default `hazelwood-favicon.png` is used outside seasonal windows.
