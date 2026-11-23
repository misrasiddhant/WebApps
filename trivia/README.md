# Brightside Trivia

![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-multiplayer-010101?style=flat-square&logo=socket.io&logoColor=white)

Brightside Trivia is a category-driven multiplayer trivia game. Players join teams from their phones, answer questions in the browser, and use a timed buzzer with optional negative marking. Question data is stored in JSON files under [`src/data`](./src/data).

## Setup

Prerequisites: Node.js 18+ and npm.

```bash
cd trivia
npm install
```

## Run in development

```bash
npm run dev
```

This starts the Vite development server. For the multiplayer host flow, use the production build and server:

```bash
npm run build
npm start
```

Open the URL printed by the server, normally `http://localhost:3000`. Devices on the same Wi-Fi network can connect using the LAN URL printed in the terminal.
