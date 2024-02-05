const net = require("net");
const PORT = 4221;
const LOCALHOST = 'localhost';

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
    server.close();
  });
});

server.listen(PORT, LOCALHOST);
