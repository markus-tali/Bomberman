package main

import (
	"encoding/json"
	"fmt"
)

type Hub struct {
	Clients     map[string]*Client
	broadcast   chan []byte
	register    chan *Client
	unregister  chan *Client
	timer       *Timer
	gameStarted bool
}

func InitHub() *Hub {
	return &Hub{
		Clients:    make(map[string]*Client),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		timer:      InitTimer(),
	}
}

func (h *Hub) CheckUsername(username string) bool {
	_, exist := h.Clients[username]
	return exist
}

func (h *Hub) LaunchRoutines() {
	go h.Run()
	go h.timer.RunCountDown()
}

func (h *Hub) Run() {
	playerReady := 0
	for {
		select {
		case client := <-h.register:
			if !h.gameStarted {
				h.RegisterClient(client)
			}
		case client := <-h.unregister:
			h.UnregisterClient(client)

		case t := <-h.timer.broadcastTime:
			h.UpdateTimer(t)

		case message := <-h.broadcast:
			var msg *Message
			json.Unmarshal(message, &msg)

			switch msg.Type {
			case "map":
				playerReady++
				if playerReady == len(h.Clients) {
					jsonMap := GenerateMap()
					for _, client := range h.Clients {
						client.send <- jsonMap
					}
					playerReady = 0
				}
			case "chat", "move", "end", "death", "degats", "bomb", "bonus", "lock", "unlock":
				for _, client := range h.Clients {
					client.send <- message
				}
			}

		}
	}
}

func (hub *Hub) RegisterClient(client *Client) {
	hub.Clients[client.Username] = client

	connectedList := make([]string, 0)

	for _, hubClient := range hub.Clients {
		connectedList = append(connectedList, hubClient.Username)
	}

	message := &Connected{
		Type:      "join",
		Body:      client.Username + " has joined the lobby",
		Sender:    client.Username,
		Connected: connectedList,
	}
	fmt.Printf("%s Joined the chat !\n", client.Username)
	joinedMessage, err := json.Marshal(message)
	if err != nil {
		fmt.Println(err)
		return
	}
	for _, hubClient := range hub.Clients {
		hubClient.send <- joinedMessage
	}
	hub.CheckCountDown()
}

func (hub *Hub) UnregisterClient(client *Client) {
	if _, ok := hub.Clients[client.Username]; ok {
		connectedList := make([]string, 0)

		for _, hubClient := range hub.Clients {
			connectedList = append(connectedList, hubClient.Username)
		}

		message := &Connected{
			Type:      "leave",
			Body:      client.Username + " left the chat",
			Sender:    client.Username,
			Connected: removeElement(connectedList, client.Username),
		}
		fmt.Printf("%s left the chat !\n", client.Username)

		leftMessage, err := json.Marshal(message)
		if err != nil {
			fmt.Println(err)
			return
		}
		for _, hubClient := range hub.Clients {
			if hubClient.Username != client.Username {
				hubClient.send <- leftMessage
			}
		}
		close(hub.Clients[client.Username].send)
		delete(hub.Clients, client.Username)

		hub.CheckCountDown()
	}
}

func removeElement(connected []string, clientDisconnected string) []string {
	var newTab []string
	for _, user := range connected {
		if clientDisconnected != user {
			newTab = append(newTab, user)
		}
	}
	newConnected := []string{}
	newConnected = append(newConnected, newTab...)
	return newConnected
}
