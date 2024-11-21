# Bomberman DOM

Welcome to our **Bomberman DOM**, a thrilling multiplayer game where strategy, skill, and quick thinking lead to victory!

## How to Run

1.Navigate to the backend folder in the project root.

2.Start the backend server by running:

`go run .`

3.In new terminal navigate to frontend directory

4.Install node modules:

`npm install`

5.Run dev server:

`npm run dev`

6.Go to link shown in terminal (usually: `localhost:5173`), enter your nickname and start playing!

## Core GamePlay

- **Player Nickname**: Players are prompted for a nickname before entering the game.
- **Lobby System**: Join a waiting room with a live player counter.
- **Real-Time Chat**: Chat with other players in the lobby through WebSocket technology.
- **Countdown Timer**: Once enough players join or after 20 seconds, a countdown starts before the game begins.

## Functional Overview

- **Framework**: The game is built using a custom mini-framework.
- **WebSocket Communication** : Enables real-time updates for player movement, chat, and game state.
- **DOM-Based Rendering**: All interactions are managed without external rendering technologies like Canvas or WebGL.

## Audit

- **Audit**: [Audit Report](https://github.com/01-edu/public/tree/master/subjects/bomberman-dom/audit)

## Authors

- **cpiisner** - `https://01.kood.tech/git/cpiisner/bomberman-dom`
- **mmatiklj** - `https://01.kood.tech/git/mmatiklj`
- **pnoorkoi** - `https://01.kood.tech/git/pnoorkoi`
- **mtali** - `https://01.kood.tech/git/mtali`
- **kumal** - `https://01.kood.tech/git/kumal`

## Big Thanks 🎉

A huge round of applause goes to **ureinkub** and **kelmik** —without their incredible efforts, this project would not have been possible. Your contributions were invaluable!
