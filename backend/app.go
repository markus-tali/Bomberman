package main

import "net/http"

type App struct {
}

func NewApp() *App {
	return &App{}
}

func (app *App) ServeHTTP(hub *Hub) {
	http.HandleFunc("/api/join", func(w http.ResponseWriter, r *http.Request) {
		JoinHandler(w, r, hub)
	})
}
