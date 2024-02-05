const net = require("net");
const PORT = 4221;
const LOCALHOST = 'localhost';
const Path = require('path');
const fs = require('fs');

class HTTPRequest{
	
	response;
	
	httpMethod;
	path;
	httpVersion;
	headers;
	body;

	#readHeaderLine(line){
		let headerKey = "";
		let headerVal = "";
		let i = 0;
		while(line[i] !== ':') headerKey += line[i++];
		i+=2;
		while(i < line.length) headerVal  += line[i++];

		return {headerKey, headerVal};
	}

	constructor(req){
		let lines = req.split('\r\n');
		let startLine = lines[0];

		let arr = startLine.split(' ');
		this.httpMethod = arr[0];
		this.path = arr[1];
		this.httpVersion = arr[2];

		let i = 0;
		while(lines[i] !== ''){
			let { headerKey, headerVal } = this.#readHeaderLine(lines[i]);
			this.headers[headerKey] = headerVal;
			i++;
		}
		i++;
		if('Content-Length' in this.headers){
			this.body = lines[i].slice(0, this.headers['Content-Length']);
		}

		return this;
	}
	
	getResponse(){
		switch(this.httpMethod){
			case 'GET':
				this.handleGet();
				break; 
			case 'POST':
				this.handlePost();
				break;
		}
		return this.response;
	}
	
	handleGet(){
		let path = this.parseHTTPPath();
		switch (path[0]) {
			case '':
				this.setResponseToEmpty200();
				break;
			
			case 'echo':
				this.echoResource();
				break;
			
			case 'user-agent':
				this.userAgentResource();
				break;
			
			case 'files':
				this.getFilesResource();
				break;
			
			default:
				this.setResponseTo404();
				break;
		}          
	}

	handlePost(){
		let path = this.parseHTTPPath();
		switch(path[0]){
			case 'files':
				this.postFilesResource();
				break;
			default:
				this.setResponseTo404();
				break;
		}
	}

	parseHTTPPath(){
		return this.path.split('/').slice(1);
	}

	echoResource(){
		let message = this.path.slice(6);
		this.setResponseToContent200(message, 'text/plain');
	}

	userAgentResource(){
		let message = this.headers['User-Agent'];
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

	postFilesResource(){
		let fileName = this.path.slice(7);
		let filePath = Path.join(directoryPath, fileName);
		try{
			fs.writeFileSync(filePath, this.body);
		}
		catch(err){
			console.log(`Error occured while writing to file with path ${filePath}: ${err}`);
		}
		this.setResponseTo201();
	}

	setResponseToEmpty200(){
		this.response = `${this.httpVersion} 200 OK\r\n\r\n`;
	}

	setResponseTo201(){
		let response = `${this.httpVersion} 201 Created\r\n\r\n`;
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
