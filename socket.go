package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Client struct {
	connection  *websocket.Conn
	send        chan []byte
	connOwnerId string
	mu          sync.Mutex
}

type Player struct {
	ID       string
	Conn     *websocket.Conn
	Stats    PlayerStats
	Position Position
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all connections
	},
}

var players = make(map[string]*Player)
var playersMutex = &sync.Mutex{}

func broadcastMessage(senderID, message string) {
	playersMutex.Lock()
	defer playersMutex.Unlock()

	type ChatMessage struct {
		Sender  string `json:"sender"`
		Message string `json:"message"`
	}

	chatMessage := ChatMessage{
		Sender:  senderID,
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

func broadcastGameState() {
	playersMutex.Lock()
	defer playersMutex.Unlock()

	type GameState struct {
		Players map[string]*Player `json:"players"`
		Map     [][]MapTile        `json:"map"`
	}

	gameState := GameState{
		Players: players,
		Map:     mapData,
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

func WsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Error while upgrading connection: %v", err)
		return
	}
	defer conn.Close()

	playerID := r.URL.Query().Get("id")
	player := &Player{
		ID:   playerID,
		Conn: conn,
		Stats: PlayerStats{
			MaxBombs:       1,
			ExplosionRange: 1,
			MovementSpeed:  1,
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
			Action  string `json:"action"`
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
