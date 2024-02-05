const net = require("net");
const PORT = 4221;
const LOCALHOST = 'localhost';

class HTTPRequest{
    
    response;

    constructor(req){
        let startLine = req.split('\r\n')[0];
        let arr = startLine.split(' ');
        this.httpMethod = arr[0];
        this.path = arr[1];
        this.httpVersion = arr[2];
        return this;
    }
    
    getResponse(){
        switch(this.httpMethod){
            case 'GET':
                handleGet();
                break; 
        }
        return this.response;
    }
    
    handleGet(){
        let path = parseHTTPPath(this.path);
        if(path[0] == ''){
            response = `${this.httpVersion} 200 OK\r\n\r\n`;
        } else if(path[0] == 'echo'){
            echoResource(path[1]);
        }
    }

    parseHTTPPath(path){
        return path.split('/').slice(1);
    }

    echoResource(message){
        let response = `${this.httpVersion} 200 OK\r\n`;
        response += `Content-Type: text/plain\r\n`;
        response += `Content-Length: ${message.length}\r\n`;
        response += `\r\n`;
        response += `${message}\r\n`;
        this.response = response;
    }


};

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    socket.on('data', (data) => {
        console.log(`Received data: ${data}`);

        let httpObject = new HTTPRequest(data.toString());
        let response = httpObject.getResponse();
        socket.write(response);

        socket.end();
    });
    
    socket.on("close", () => {
        console.log('Closing the socket');
        socket.end();
  });
});

server.listen(PORT, LOCALHOST);
