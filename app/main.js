const net = require("net");
const PORT = 4221;
const LOCALHOST = 'localhost';
const Path = require('path');
const fs = require('fs');

class HTTPRequest{
    
    response;

    constructor(req){
        let lines = req.split('\r\n');
        let startLine = lines[0];
        let hostLine = lines[1];
        let userAgentLine = lines[2];

        let arr = startLine.split(' ');
        this.httpMethod = arr[0];
        this.path = arr[1];
        this.httpVersion = arr[2];
        
        if(hostLine)
        this.host = hostLine.split(' ')[1];

        if(userAgentLine)
        this.userAgent = userAgentLine.split(' ')[1];

        return this;
    }
    
    getResponse(){
        switch(this.httpMethod){
            case 'GET':
                this.handleGet();
                break; 
        }
        return this.response;
    }
    
    handleGet(){
        let path = this.parseHTTPPath(this.path);
        if(path[0] == ''){
            this.response = `${this.httpVersion} 200 OK\r\n\r\n`;
        } else if(path[0] == 'echo'){
            this.echoResource();
        }else if(path[0] == 'user-agent'){
            this.userAgentResource();
        }else if(path[0] == 'files'){
            this.getFilesResource();
        }
        else{
            this.setResponseTo404();
        }
    }

    parseHTTPPath(path){
        return path.split('/').slice(1);
    }

    echoResource(){
        let message = this.path.slice(6);
        this.setResponseToContent200(message, 'text/plain');
    }

    userAgentResource(){
        let message = this.userAgent;
        this.setResponseToContent200(message, 'text/plain');
    }

    getFilesResource(){
        let fileName = this.path.slice(7);
        let filePath = Path.join(directoryPath, fileName);
        if(!fs.existsSync(filePath)){
            this.setResponseTo404();
            return;
        }
        const data = fs.readFileSync(filePath);
        this.setResponseToContent200(data, 'application/octet-stream'); 

    }

    setResponseTo404(){
        this.response = `${this.httpVersion} 404 Not Found\r\n\r\n`;
    }

    setResponseToContent200(content, contentType){
        let response = `${this.httpVersion} 200 OK\r\n`;
        response += `Content-Type: ${contentType}\r\n`;
        response += `Content-Length: ${content.length}\r\n`;
        response += `\r\n`;
        response += `${content}\r\n`;
        this.response = response;
    }
};

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");
let directoryPath;

(function initialize(args){
    if(args.length == 0) return;
    let flag = args[0].slice(2);
    if(flag === 'directory'){
        directoryPath = args[1];        
        console.log("setting directory", directoryPath);
    }
})(process.argv.slice(2));

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    socket.on('data', (data) => {
        console.log(`Received data: ${data}`);

        let httpObject = new HTTPRequest(data.toString());
        let response = httpObject.getResponse();
        console.log(`Response to client: ${response}`);
        socket.write(response);

        socket.end();
    });
    
    socket.on('error', (err) => {
        console.log(`Error occured: ${err.message}`);
    });

    socket.on('end', () => {
        console.log("Socket connection ended");
        socket.end();
    })

    socket.on("close", (hadError) => {
        if(hadError){
            console.log('Closing the socket because of an error');
        }
        else{
            console.log('Closing the socket successfully');
        }
  });
});

server.listen(PORT, LOCALHOST, () => {
    console.log(`Listening on ${LOCALHOST}:${PORT}`);
});
