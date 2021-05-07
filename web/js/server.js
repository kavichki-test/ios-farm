var Server = require('ws').Server;
var iosDevice = require('node-ios-device');
var exec = require('child_process').exec, child;

var port = process.env.PORT || 9030;
var ws = new Server({port: port});
var clients = [ ]; 	/* List of all connected clients */
var devices = [ ]; 	/* Lsit of all devices and theirs status */
var ports = [ ];	/* List of ports for devices connection and theirs status*/

var portFrom = 9231;
var portTo = 9299;

console.log('============= START ==============');

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function updateDevicesInformation() {
	clients.forEach(function (client) {
		if (client['type'] == 'landingpage') {
			client.send(JSON.stringify({'action': 'deviceslist', 'data': devices}));
			console.log('-> Sent updated information about devices list to landing pages');
		}
	});
}

function findPort(udid) {
	let port = getRandomInt(portFrom, portTo);
	let effort = 0;

	console.log('Effort ' + effort + ' and port is ' + port);

	while ((port in ports)&&(effort < 10)) {
		port = getRandomInt(portFrom, portTo);
		effort++;
		console.log(port + ' - ' + effort);
	}

	if (effort >= 10 ) {
		return 'Didn\'t find free ports from ' + portFrom + ' to ' + portTo;
	}else {
		ports[port] = port;
		ports[port]['status'] = 'busy';
		ports[port]['udid'] =  udid;

		return port;
	}
}

function startAppium() {
	let command = 'appium';
	exec(command,
	    function (error, stdout, stderr) {
	        if (error !== null) {
	             console.log('exec error: ' + error);
	        }
	    }
    );
    console.log('Appium was started');
}

iosDevice
    .trackDevices()
    .on('devices', function (list_of_devices) {
    	if (devices.length == 0) {
    		devices = list_of_devices;
    		devices.forEach(function (device) {
    			device['status'] = 'free';
    		})
    	}else {
    		let position = 0;
    		devices.forEach(function (device) {
    			if (!(device in list_of_devices)) {
    				devices.splice(position, 1);
    			}
    			position ++;
    		})
    		list_of_devices.forEach(function (device) {
    			if (!(device in devices)) {
    				devices.push(device);
    				devices.forEach(function (item) {
    					if (item['status'] !== undefined) item['status'] = 'free';
    				})
    			}
    		});
    	}
    	updateDevicesInformation();
    })
    .on('error', function (err) {
        console.error('Error!', err);
    });

ws.on('connection', function(w, req){

	var string__from_connection = req.url.replace('/:', '');
	var data__from_connection = string__from_connection.split('/');
	var userID = data__from_connection[0].toString();

	clients[userID] = w;
	clients[userID]["type"] = data__from_connection[1];

	console.log('Connected: UserID [' + userID + '] with _' + clients[userID]["type"] + '_ type');

	if (clients[userID]["type"] == 'landingpage') {
		let data = [ ];

		devices.forEach(function (device){
			console.log(device);
			data.push({"udid": device["udid"], "name": device["name"], "ios": device["productVersion"], "deviceclass": device["deviceClass"]})
		});

		clients[userID].send(JSON.stringify({"action": "deviceslist", "data": data}));
		console.log('There is Landing page and SERVER transmited devices\'s list')
	}

	w.on('message', function(message){
		let path = 'PATH TO YOUR FOLDER';
		console.log(' -> Received from ' + userID + ': ' + message);

		var messageArray = JSON.parse(message)
		var toUserWebSocket = clients[messageArray["toudid"]]

		switch (messageArray['whoyouare']) {
			case 'device':
				if (toUserWebSocket) {
					messageArray["toudid"] = userID
					toUserWebSocket.send(JSON.stringify(messageArray))
					console.log('-> Sent to ' + messageArray["toudid"] + ': ' + JSON.stringify(messageArray))
				}
				if(messageArray["action"] == 'deviceconnected') {
					clients[userID]['udid'] = messageArray["udid"];
				}
				if(messageArray["action"] == 'starttests') {
					let device = devices.find(obj => obj["udid"] == messageArray['udid']);
					let command = 'sh ' + path + '/starttests.sh ' + messageArray['udid'] + ' ' + device["name"];
					console.log('START PYTHON TESTS starttests.SH');
					console.log('Ready to exec = ' + command);
					exec(command, {maxBuffer: 1024 * 500}, 
					    function (error, stdout, stderr) {
					    	console.log('RUN from NODE');
					    	console.log('stdout: ' + stdout);
						    console.log('stderr: ' + stderr);
					        if (error !== null) {
					             console.log('exec error: ' + error);
					        }
					    }
				    );
				}
				break;
			case 'landingpage':
				if(messageArray["action"] == "run") {
					let port = findPort(messageArray['udid']);
					let message_type_for_port = typeof port;

					if (message_type_for_port !== 'string') {
						let command = 'websocketd --port=' + port + ' --staticdir=' + path + '/web sh ' + path + '/smile.sh ' + messageArray['udid'] + ' ' + messageArray['name'];
						console.log('START SMILE.SH');
						console.log('Ready to exec = ' + command);
						exec(command, {maxBuffer: 1024 * 500}, 
						    function (error, stdout, stderr) {
						        console.log('stdout: ' + stdout);
						        console.log('stderr: ' + stderr);
						        if (error !== null) {
						             console.log('exec error: ' + error);
						        }
						    }
					    );

					    devices.forEach(function (device) {
					    	if (device["udid"] == messageArray['udid']) {
					    		device["status"] = 'busy';
					    		device["port"] = port;
					    	}
					    });
					    updateDevicesInformation();
					    w.send(JSON.stringify({'action': 'open', 'url': 'http://localhost:' + port + '/?' + messageArray['udid']}));
					}
				}
				break;
			case 'commuter':
				console.log("Commuter SEND");
				if(messageArray["action"] == 'deviceready') {
					clients.forEach(function (client) {
						if (client["type"] == 'device') {
							console.log('FOUND device');
						}
						if ((client["type"] == 'device')&&(client["udid"] == messageArray["udid"])) {
							client.send(JSON.stringify({'action': messageArray["action"], "udid": messageArray["udid"]}));
						}
					});
				}
				break;
		}

	});

	w.on('close', function() {
		devices.forEach(function (device) {
	    	if (device["udid"] == clients[userID]["udid"]) {
	    		device["status"] = 'free';
	    		let port = device["port"];
	    		delete device["port"];
	    	}
	    });
		clients[userID].send(JSON.stringify({'action': 'free', 'udid': userID}));
		console.log('Deleted: Client ID ' + userID + ' with type ' + clients[userID]["type"]);
		updateDevicesInformation();
		delete clients[userID];
		delete ports[port];
	});

});

startAppium();