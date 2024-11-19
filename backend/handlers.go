package main

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func JoinHandler(w http.ResponseWriter, r *http.Request, hub *Hub) {
	(w).Header().Set("Access-Control-Allow-Origin", "*")
	var msg struct {
		Username string `json:"username"`
	}
	json.NewDecoder(r.Body).Decode(&msg)

	if hub.CheckUsername(msg.Username) || len(msg.Username) == 0 || len(msg.Username) > 10 {
		http.Error(w, "Username is already in use", 400)
		return
	}
}

func WebsocketHandler(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		return
	}

	username := r.URL.Query().Get("username")

	client := &Client{
		hub:      hub,
		conn:     conn,
		send:     make(chan []byte, 256),
		Username: username,
	}

	client.hub.register <- client
	go client.Write()
	go client.Read()
}
