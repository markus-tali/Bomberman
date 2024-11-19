package main

import (
	"github.com/gorilla/websocket"
)

type Client struct {
	hub      *Hub
	conn     *websocket.Conn
	send     chan []byte
	Username string
}

func (client *Client) Read() {
	defer func() {
		client.hub.unregister <- client
		client.conn.Close()
	}()
	for {
		_, message, err := client.conn.ReadMessage()
		if err != nil {
			client.hub.unregister <- client
			client.conn.Close()
			break
		}
		client.hub.broadcast <- message
	}
}

func (client *Client) Write() {
	defer func() {
		client.conn.Close()
	}()
	for message := range client.send {
		w, err := client.conn.NextWriter(websocket.TextMessage)
		if err != nil {
			return
		}
		w.Write(message)
		for len(client.send) > 0 {
			w.Write(<-client.send)
		}
		if err := w.Close(); err != nil {
			return
		}
	}
}
