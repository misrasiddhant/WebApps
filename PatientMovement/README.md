# Patient Movement

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-f7df1e?style=flat-square&logo=javascript&logoColor=black)

Patient Movement is a small browser simulation of patients moving randomly around the viewport. It begins with infected and healthy patients, detects close encounters, and displays the current infected count.

## Setup

The project includes an Express server and uses jQuery from the CDN. Install the local dependency from this directory:

```bash
cd PatientMovement
npm install
```

## Run

The package manifest does not currently define a `start` script. Run the server directly:

```bash
node index.js
```

Open `http://localhost:3000`. The server serves [`PatientMovement.html`](./PatientMovement.html).
