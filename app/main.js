const net = require("net");
const PORT = 4221;
const LOCALHOST = 'localhost';
const HTTPRequest = require('./HTTPRequest');

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
