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
var jsdom = require('jsdom');

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
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require("stylus").middleware({
      src: __dirname + "/public",
      dest: __dirname + "/public",
      compress: false
    }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.get('/oscars', function(req, res){
	res.render('oscars', {hostname: req.headers.host});
});

app.get('/ballot', function(req, res){
	res.render('ballot', {hostname: req.headers.host});
});

app.get('/homepage', function(req, res){
	res.render('homepage', {hostname: req.headers.host});
});

app.get('/form', function(req, res){
	res.render('form', {hostname: req.headers.host});
});

// app.get('/oscars', function(req, res){
// 	res.render('index.jade', {hostname: req.headers.host});
// });
// 
// app.get('/vulture-HP.html', function(req, res) {
//     res.sendfile(__dirname+'/vulture-HP.html');
// });
// 
// app.get('/oscars-ballot.html', function(req, res) {
//     res.sendfile(__dirname+'/oscars-ballot.html');
// });
// 
// app.get('/form.html', function(req, res) {
//     res.sendfile(__dirname+'/form.html');
// });

// app.get('/:file', function(req, res) {
//     res.sendfile(__dirname+'/'+req.param('file'));
// });




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