var http = require('http'),
fs = require('fs'),
// NEVER use a Sync function except at start-up!
index = fs.readFileSync(__dirname + '/index.html');

// Send index.html to all requests
var app = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);
});

// Socket.io server listens to our app
var io = require('socket.io').listen(app);

// Send current time to all connected clients
function sendTime() {
    io.sockets.emit('time', { time: new Date().toJSON() });
}

// Send current time every 10 secs
setInterval(sendTime, 10000);
var counter=0; 
// Emit welcome message on connection
io.sockets.on('connection', function(socket) {
    socket.emit('welcome', { message: 'Welcome!' });
    counter++;
    console.log('connect, num users:'+counter);
    
    socket.on('i am client', console.log);
socket.on('disconnect',function() {
    if (counter)  { 
	--counter;
	console.log('disconnect, num users:'+counter);
    }
});
});

app.listen(8090);
