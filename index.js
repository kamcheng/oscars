/*var express = require('express');
var mongo = require('mongoskin');

var app = express(express.logger());


app.get('/', function(request, response) {
	var conn = mongo.db('mongodb://localhost:27017/mydb');
	conn.collection('chatRoom').find().toArray(function(err, items) {
		if (err) throw err;
		
		response.send(JSON.stringify(items));
	});  
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Listening on ' + port);
});*/

var express = require('express');
var app = express();
var http = require('http');
var url=require('url');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var mongo = require('mongoskin');
var conn = mongo.db('mongodb://10.176.200.103:27017/mydb');

var port = process.env.PORT || 3000;

server.listen(port);

// routing
/*
app.get('/', function (req, res) {
	var pathname=url.parse(req.url).pathname;
	console.log(pathname);
    switch(pathname){
        case '/oscars':
			console.log('Listening on oscars');
            res.sendfile(__dirname + '/oscars.html');
        break;
        default:
			console.log('Listening on index');
            res.sendfile(__dirname + '/index.html');
        break;
    }
});
*/

app.get('/:file', function(req, res) {
    res.sendfile(__dirname+'/'+req.param('file'));
});

io.sockets.on('connection', function (socket) {
	
	socket.on('getWinners', function () {
		conn.collection('oscars').find().toArray(function(err, items) {
			if (err) throw err;
			//var item = JSON.stringify(items);
			socket.emit('sendWinners', items);
		});  
	});
	
	socket.on('winners', function (winObj) {
		socket.broadcast.emit('result', winObj);
		conn.collection('oscars').find({Category:winObj.Category}).toArray(function(err, result) {
		    if(result.length > 0){
				conn.collection('oscars').update({Category:winObj.Category},winObj);
			} else {
				conn.collection('oscars').insert(winObj);
			}
		});
	});
});