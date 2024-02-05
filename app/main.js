const net = require("net");
const PORT = 4221;
const LOCALHOST = 'localhost';

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    socket.on('data', (data) => {
        console.log(`Received data: ${data}`);
        let response = "HTTP/1.1 200 OK\r\n\r\n";
        socket.write(response);
        socket.end();
    })
    
    socket.on("close", () => {
        console.log('Closing the socket and ending the server');
        socket.end();
  });
});

server.listen(PORT, LOCALHOST);
