const express = require('express')
const path = require("node:path");
const os = require("node:os");
const http = require("node:http");
const { Server } = require('socket.io');
const handler = require('./host/handler')
const app = express();
const port = Number(process.env.PORT) || 3000;
const httpServer = http.createServer(app);
const io = new Server(httpServer);
let firstTap = null;
let buzzerOpen = false;
let buzzerQueue = [];
let buzzerUnlockTimer = null;
let buzzerUnlockAt = null;
let lastWrongTeam = null;
let attemptNumber = 0;
const teams = new Map();

function getBuzzerState() {
    return { firstTap, buzzerOpen, buzzerUnlockAt, buzzerQueue: buzzerQueue.map(({ name, attempt }) => ({ name, attempt })), teams: [...teams.values()] };
}

function scheduleBuzzerOpen() {
    if (buzzerUnlockTimer) clearTimeout(buzzerUnlockTimer);
    const delay = 3000 + Math.floor(Math.random() * 3001);
    buzzerUnlockAt = Date.now() + delay;
    buzzerUnlockTimer = setTimeout(function () {
        buzzerOpen = true;
        buzzerUnlockAt = null;
        buzzerUnlockTimer = null;
        io.emit('buzzer:state', getBuzzerState());
    }, delay);
}

function getLanAddress() {
    const interfaces = os.networkInterfaces();
    for (const entries of Object.values(interfaces)) {
        for (const entry of entries || []) {
            if (entry.family === 'IPv4' && !entry.internal) return entry.address;
        }
    }
    return 'localhost';
}

app.get('/api/access', function (req, res) {
    const forwardedPort = Number(req.headers['x-forwarded-port']);
    const requestPort = Number(String(req.headers.host || '').split(':').pop());
    const accessPort = forwardedPort || requestPort || port;
    res.json({ url: `http://${getLanAddress()}:${accessPort}` });
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
})

app.get('/buzz', function (req) {
    handler.handleBuzz(req);
})


app.use(express.static(path.join(__dirname, 'dist')));

app.get(/.*/, function (req, res) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

io.on('connection', function (socket) {
    socket.emit('buzzer:state', getBuzzerState());

    socket.on('team:join', function ({ name: teamName, teamId: requestedTeamId } = {}) {
        const name = String(teamName || '').trim().slice(0, 24);
        if (!name) return;
        const teamId = String(requestedTeamId || '').trim().slice(0, 64);
        const existingTeam = teamId ? teams.get(teamId) : null;
        if (existingTeam && existingTeam.name.toLowerCase() === name.toLowerCase()) {
            existingTeam.socketId = socket.id;
            socket.emit('team:joined', { name: existingTeam.name, teamId });
            io.emit('buzzer:state', getBuzzerState());
            return;
        }
        if ([...teams.values()].some((team) => team.name.toLowerCase() === name.toLowerCase())) {
            socket.emit('team:error', 'That team name is already in use.');
            return;
        }
        const newTeamId = teamId || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        teams.set(newTeamId, { name, score: 0, socketId: socket.id });
        socket.emit('team:joined', { name, teamId: newTeamId });
        io.emit('buzzer:state', getBuzzerState());
    });

    socket.on('buzzer:tap', function () {
        const team = [...teams.values()].find((candidate) => candidate.socketId === socket.id);
        if (!team || !buzzerOpen || buzzerQueue.some((candidate) => candidate.socketId === socket.id)) return;
        const buzzerEntry = {
            name: team.name,
            socketId: socket.id,
            attempt: attemptNumber + 1,
            previousTeam: lastWrongTeam,
            at: Date.now()
        };
        attemptNumber += 1;
        buzzerQueue.push(buzzerEntry);
        firstTap = firstTap || buzzerEntry;
        io.emit('buzzer:state', getBuzzerState());
    });

    socket.on('buzzer:reset', function () {
        firstTap = null;
        buzzerOpen = false;
        buzzerUnlockAt = null;
        buzzerQueue = [];
        lastWrongTeam = null;
        attemptNumber = 0;
        io.emit('buzzer:state', getBuzzerState());
        scheduleBuzzerOpen();
    });

    socket.on('answer:correct', function () {
        if (!firstTap) return;
        const team = [...teams.values()].find((candidate) => candidate.socketId === firstTap.socketId);
        if (team) team.score += 1;
        firstTap = null;
        buzzerOpen = false;
        buzzerQueue = [];
        lastWrongTeam = null;
        attemptNumber = 0;
        io.emit('buzzer:state', getBuzzerState());
    });

    socket.on('answer:incorrect', function ({ negativeMarking = false } = {}) {
        if (!firstTap) return;
        const team = [...teams.values()].find((candidate) => candidate.socketId === firstTap.socketId);
        if (team && negativeMarking) team.score -= 1;
        lastWrongTeam = firstTap?.name || lastWrongTeam;
        attemptNumber = firstTap?.attempt || attemptNumber;
        firstTap = null;
        buzzerQueue.shift();
        firstTap = buzzerQueue[0] || null;
        io.emit('buzzer:state', getBuzzerState());
    });

    socket.on('disconnect', function () {
        buzzerQueue = buzzerQueue.filter((team) => team.socketId !== socket.id);
        firstTap = buzzerQueue[0] || null;
        io.emit('buzzer:state', getBuzzerState());
    });
});

scheduleBuzzerOpen();
httpServer.listen(port, '0.0.0.0', function () {
    const lanUrl = `http://${getLanAddress()}:${port}`;
    console.log(`Trivia is running at ${lanUrl}`);
    console.log(`Open ${lanUrl} on phones connected to the same Wi-Fi network.`);
})
