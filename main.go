package main

import (
	"log"
	"net/http"
	"sync"
	"math/rand"
	"time"
	"encoding/json"
	
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type Player struct {
	ID   string
	Conn *websocket.Conn
	Stats PlayerStats
	Position Position
}

type PlayerStats struct {
	MaxBombs int
	ExplosionRange int
	MovementSpeed int
}

type Position struct {
	X, Y float64
}

var players = make(map[string]*Player)
var playersMutex = &sync.Mutex{}
var mapData [][]MapTile

const (
	MapWidth = 15
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
	Tile Tile
	Powerup Powerup
}

func main() {
	http.Handle("/", http.FileServer(http.Dir("frontend")))
	http.HandleFunc("/ws", wsHandler)

	// Generate the map
	mapData = generateMap()

	log.Printf("Serving http://localhost:8080/")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Error while upgrading connection: %v", err)
		return
	}
	defer conn.Close()

	playerID := r.URL.Query().Get("id")
	player := &Player{
		ID: playerID,
		Conn: conn,
		Stats: PlayerStats{
			MaxBombs: 1,
			ExplosionRange: 1,
			MovementSpeed: 1,
		},
		Position: Position{X: 0, Y: 0}, // Test position, TODO: spawn players in map corners
	}

	playersMutex.Lock()
	players[playerID] = player
	playersMutex.Unlock()

	defer func() {
		playersMutex.Lock()
		delete(players, playerID)
		playersMutex.Unlock()
	}()

	// Send the map to the player
	if err := conn.WriteJSON(mapData); err != nil {
		log.Printf("Error while sending map to %s: %v", playerID, err)
		return
	}

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Printf("Error while reading message: %v", err)
			break
		}

		log.Printf("Message received from %s: %s", playerID, msg)

		// Handle player actions
		var action struct {
			Action string `json:"action"`
			Message string `json:"message,omitempty"`
		}
		if err := json.Unmarshal(msg, &action); err != nil {
			log.Printf("Error while unmarshalling message: %v", err)
			continue
		}

		handlePlayerAction(player, action.Action, action.Message)

		broadcastGameState()
	}
}

func broadcastGameState() {
	playersMutex.Lock()
	defer playersMutex.Unlock()

	type GameState struct {
		Players map[string]*Player `json:"players"`
		Map [][]MapTile `json:"map"`
	}

	gameState := GameState{
		Players: players,
		Map: mapData,
	}

	gameStateJSON, err := json.Marshal(gameState)
	if err != nil {
		log.Printf("Error while marshalling game state: %v", err)
		return
	}

	for _, player := range players {
		if err := player.Conn.WriteMessage(websocket.TextMessage, gameStateJSON); err != nil {
			log.Printf("Error while sending game state to %s: %v", player.ID, err)
			return
		}
	}
}

func broadcastMessage(senderID, message string) {
	playersMutex.Lock()
	defer playersMutex.Unlock()

	type ChatMessage struct {
		Sender string `json:"sender"`
		Message string `json:"message"`
	}

	chatMessage := ChatMessage{
		Sender: senderID,
		Message: message,
	}

	chatMessageJSON, err := json.Marshal(chatMessage)
	if err != nil {
		log.Printf("Error while marshalling chat message: %v", err)
		return
	}

	for _, player := range players {
		if err := player.Conn.WriteMessage(websocket.TextMessage, chatMessageJSON); err != nil {
			log.Printf("Error while sending chat message to %s: %v", player.ID, err)
			return
		}
	}
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
			if x % 2 == 1 && y % 2 == 1 {
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
