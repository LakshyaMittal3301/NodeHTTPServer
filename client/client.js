const net = require('net');
const readline = require('readline');

const PORT = 4221; // Replace with your desired port number
const HOST = 'localhost';

const client = new net.Socket();
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

// Connect to the server
client.connect(PORT, HOST, () => {
	console.log(`Connected to server on ${HOST}:${PORT}`);

	// Start taking user input
	function sendDataToServer(){
		rl.question('Enter command ', (input) => {
			// Send user input to the server
			input = input.toLowerCase();
			if(input === 'exit') {
				client.end();
				rl.close();
			}else{
				client.write(input);
				sendDataToServer();
			}
		});
	}

	sendDataToServer();
});

// Handle data received from the server
client.on('data', (data) => {
	console.log(`Received data from server: ${data}`);
});

// Handle the connection being closed
client.on('close', () => {
	console.log('Connection closed');
});

// Handle errors
client.on('error', (err) => {
	console.error(`Error: ${err.message}`);
});
