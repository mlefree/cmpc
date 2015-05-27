#!/usr/bin/env node
var express = require('express');
var app = express();
port = process.argv[2] || 3000;

app.get('/', function (req, res) {
	res.send('Hello World!');
});


app.get('/test', function (req, res) {
	res.send('Hello Test!');
});

app.get('/c4p_fill.php', function (req, res) {
	//var reqStr = 'req:'+JSON.stringify(req);
	var reqStr = ''+req.query.testget;
	console.log('c4p_fill.php : ? '+req.query.testget);
	var json = {'test': 10, 'test 2' : 200, 'req': reqStr };
	res.send(json);
});

var server = app.listen(port, function () {

	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);

});

/*
var http = require("http"),
url = require("url"),
path = require("path"),
fs = require("fs"),
mime = require("mime")
port = process.argv[2] || 8000;

http.createServer(function(request, response) {
	var uri = url.parse(request.url).pathname
	, filename = path.join(process.cwd(), uri);

	path.exists(filename, function(exists) {
		if(!exists) {
		  response.writeHead(404, {"Content-Type": "text/plain"});
		  response.write("404 Not Found\n");
		  response.end();
		  return;
		}

		if (fs.statSync(filename).isDirectory()) filename += '/index.html';

		fs.readFile(filename, "binary", function(err, file) {
		  if(err) {
		    response.writeHead(500, {"Content-Type": "text/plain"});
		    response.write(err + "\n");
		    response.end();
		    return;
		  }
		  var fsmime = mime.lookup(filename);
		  console.log(filename + " => " + fsmime);
		  response.writeHead(200, {"Content-Type": fsmime});
		  if (fsmime == 'application/javascript' || fsmime == 'text/html' || fsmime == 'application/json') {
			  response.write(file, "utf8");
		  } else {
			  response.write(file, "binary");
		  }

		  response.end();
		});
	});
}).listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
*/
