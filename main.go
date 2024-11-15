package main

import (
	"log"
	"math/rand"
	"net/http"
	"time"
)

type PlayerStats struct {
	MaxBombs       int
	ExplosionRange int
	MovementSpeed  int
}

type Position struct {
	X, Y float64
}

var mapData [][]MapTile

const (
	MapWidth  = 15
	MapHeight = 15
)

type Tile int

const (
	Empty Tile = iota
	Indestructible
	Destructible
)

type Powerup int

const (
	NoPowerup Powerup = iota
	IncreaseBombs
	IncreaseRange
	IncreaseSpeed
)

type MapTile struct {
	Tile    Tile
	Powerup Powerup
}

func main() {
	http.Handle("/", http.FileServer(http.Dir("frontend")))
	http.HandleFunc("/ws", WsHandler)

	// Generate the map
	mapData = generateMap()

	log.Printf("Serving http://localhost:8080/")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func generateMap() [][]MapTile {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	mapData := make([][]MapTile, MapHeight)
	for i := range mapData {
		mapData[i] = make([]MapTile, MapWidth)
	}

	// Generate indestructible walls
	for y := 0; y < MapHeight; y++ {
		for x := 0; x < MapWidth; x++ {
			if x%2 == 1 && y%2 == 1 {
				mapData[y][x] = MapTile{Tile: Indestructible}
			}
		}
	}

	// Generate destructible walls
	for y := 0; y < MapHeight; y++ {
		for x := 0; x < MapWidth; x++ {
			if mapData[y][x].Tile == Empty && r.Float32() < 0.3 {
				mapData[y][x] = MapTile{Tile: Destructible}
				if r.Float32() < 0.2 {
					mapData[y][x].Powerup = Powerup(r.Intn(3) + 1)
				}
			}
		}
	}

	return mapData
}

func handlePowerup(player *Player, powerup Powerup) {
	switch powerup {
	case IncreaseBombs:
		player.Stats.MaxBombs++
	case IncreaseRange:
		player.Stats.ExplosionRange++
	case IncreaseSpeed:
		player.Stats.MovementSpeed++
	}
}

func getPlayerTiles(player *Player) []Position {
	// Assuming each tile is a 1x1 unit
	tileX := int(player.Position.X)
	tileY := int(player.Position.Y)
	return []Position{
		{X: float64(tileX), Y: float64(tileY)},
		{X: float64(tileX + 1), Y: float64(tileY)},
		{X: float64(tileX), Y: float64(tileY + 1)},
		{X: float64(tileX + 1), Y: float64(tileY + 1)},
	}
}

func canMoveTo(player *Player, newX, newY float64) bool {
	TileX := int(newX)
	TileY := int(newY)
	if TileX < 0 || TileX >= MapWidth || TileY < 0 || TileY >= MapHeight {
		return false
	}
	if mapData[TileY][TileX].Tile == Indestructible || mapData[TileY][TileX].Tile == Destructible {
		return false
	}
	return true
}

func movePlayer(player *Player, direction string) {
	speed := float64(player.Stats.MovementSpeed) * 0.1
	newX, newY := player.Position.X, player.Position.Y

	switch direction {
	case "up":
		newY -= speed
	case "down":
		newY += speed
	case "left":
		newX -= speed
	case "right":
		newX += speed
	}

	if canMoveTo(player, newX, newY) {
		player.Position.X = newX
		player.Position.Y = newY

		// Check for powerups
		tiles := getPlayerTiles(player)
		for _, tile := range tiles {
			if mapData[int(tile.Y)][int(tile.X)].Powerup != NoPowerup {
				handlePowerup(player, mapData[int(tile.Y)][int(tile.X)].Powerup)
				mapData[int(tile.Y)][int(tile.X)].Powerup = NoPowerup
			}
		}
	}
}

func handlePlayerAction(player *Player, action, message string) {
	switch action {
	case "up", "down", "left", "right":
		movePlayer(player, action)
	case "placeBomb":
		// TODO: Implement
	case "message":
		broadcastMessage(player.ID, message)
	}
}
