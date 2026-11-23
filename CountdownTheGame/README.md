# Countdown The Game

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)

A Node.js recreation of one of my favourite British TV show *Countdown* (*8 Out of 10 Cats Does Countdown* TBH), featuring the classic Letters and Numbers rounds.

## Features
- **Letters Round**: Generate a mix of vowels and consonants to form the longest word.
- **Numbers Round**: Solve arithmetic puzzles using randomly generated numbers.
- **Countdown Clock (ToDo)**: Implements a timer for rounds to simulate the real game experience.

## Setup

Prerequisites: Node.js 18+ and npm.

```bash
cd CountdownTheGame
npm install
```

## Run

The package manifest does not currently define a run script. Start the Express server directly:

```bash
node index.js
```

Open `http://localhost:3000`. The browser games are available at `/wordgame` and `/numbergame`.
