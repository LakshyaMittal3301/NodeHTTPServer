const Path = require('path');
const fs = require('fs');

class HTTPRequest{
	
	response;
	
	httpMethod;
	path;
	httpVersion;
	headers;
	body;

    directoryPath;

	readHeaderLine(line){
		let headerKey = "";
		let headerVal = "";
		let i = 0;
		while(line[i] !== ':') headerKey += line[i++];
		i+=2;
		while(i < line.length) headerVal  += line[i++];
		console.log(headerKey, headerVal);
		return {headerKey, headerVal};
	}

	constructor(req, directoryPath){
        this.directoryPath = directoryPath;

        let lines = req.split('\r\n');
		let startLine = lines[0];
        
		let arr = startLine.split(' ');
		this.httpMethod = arr[0];
		this.path = arr[1];
		this.httpVersion = arr[2];
        
		this.headers = {};
		let i = 1;
		while(lines[i] !== ''){
			console.log('Line number: ', i, ', line: ', lines[i]);
			let { headerKey, headerVal } = this.readHeaderLine(lines[i]);
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
		let filePath = Path.join(this.directoryPath, fileName);
		if(!fs.existsSync(filePath)){
			this.setResponseTo404();
			return;
		}
		const data = fs.readFileSync(filePath);
		this.setResponseToContent200(data, 'application/octet-stream'); 

	}

	postFilesResource(){
		let fileName = this.path.slice(7);
		let filePath = Path.join(this.directoryPath, fileName);
		try{
			let fd = fs.openSync(filePath, 'w');
			fs.writeFileSync(fd, this.body);
			console.log("Wrote to file successfully");
			this.setResponseTo201();
		}
		catch(err){
			console.log(`Error occured while writing to file with path ${filePath}: ${err}`);
			this.setResponseTo404();
		}
	}

	setResponseToEmpty200(){
		this.response = `${this.httpVersion} 200 OK\r\n\r\n`;
	}

	setResponseTo201(){
		this.response = `${this.httpVersion} 201 Created\r\n\r\n`;
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

module.exports = HTTPRequest;