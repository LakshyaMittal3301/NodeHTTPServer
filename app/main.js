const net = require("net");
const PORT = 4221;
const LOCALHOST = 'localhost';

function parseHTTPRequest(req){
    let startLine = req.split('\r\n')[0];
    let arr = startLine.split(' ');
    this.httpMethod = arr[0];
    this.path = arr[1];
    this.httpVersion = arr[2];
    return this;
}

function handleHTTPRequest(httpObject){
    let response = "";
    if(!httpObject) return response;
    switch(httpObject.httpMethod){
        case 'GET':
            if(httpObject.path == '/'){
                response = `${httpObject.httpVersion} 200 OK\r\n\r\n`;
            }else{
                response = `${httpObject.httpVersion} 404 Not Found\r\n\r\n`;
            }
            break; 
    }
    return response;

}

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    socket.on('data', (data) => {
        console.log(`Received data: ${data}`);

        let response = handleHTTPRequest(parseHTTPRequest(data.toString()));
        socket.write(response);

        socket.end();
    });
    
    socket.on("close", () => {
        console.log('Closing the socket');
        socket.end();
  });
});

server.listen(PORT, LOCALHOST);
