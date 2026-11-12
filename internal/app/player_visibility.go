package app

import "strings"

const hiddenPlayerUsername = "hazelwood"

func isHiddenPlayer(username string) bool {
	return strings.EqualFold(username, hiddenPlayerUsername)
}

func visibleStatusPlayers(players []StatusPlayer) []StatusPlayer {
	visible := make([]StatusPlayer, 0, len(players))
	for _, player := range players {
		if !isHiddenPlayer(player.Username) {
			visible = append(visible, player)
		}
	}
	return visible
}
