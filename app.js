const express = require('express');
const app = express();
const port = 3000;
const http = require('http');
const path = require('path');
const socket = require('socket.io');

const server = http.createServer(app);

const io = socket(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function (socket) {
    console.log('A user connected:', socket.id);

    socket.on("send-location", (data) => {
        io.emit("receive-location", { id: socket.id, ...data });
    });

    socket.on("disconnect", () => {
        io.emit("user-disconnected", socket.id);
    });
});

app.get('/', (req, res) => {
    res.render('index');
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
