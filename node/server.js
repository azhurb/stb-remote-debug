// https://github.com/einaros/ws
var WebSocketServer = require('ws').Server;

var ws_stb = new WebSocketServer({port: 8100});
var stb_socket = null;
ws_stb.on('connection', function(ws) {
    stb_socket = ws;
});

var ws_debugger = new WebSocketServer({port: 8101});
var debugger_socket = null;
ws_debugger.on('connection', function(ws) {
    debugger_socket = ws;
    ws.on('message', function(message) {
        console.log('received from debugger ws: %s', message);
    });
});

var http = require('http');
var fs = require('fs');
var index = fs.readFileSync('../debug.js');

http.createServer(function (req, res) {
    console.log(req.method, req.url);
    if (req.method === "GET" && req.url === "/debug.js"){

        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(index);

    }else if (req.method === "POST" && req.url === "/invoke"){

        var data = "";

        req.on("data", function(chunk) {
            data += chunk;
        });

        req.on("end", function() {
            console.log('received from debugger ajax: %s', data);

            if (stb_socket){

                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Credentials', 'true');
                res.setHeader('Access-Control-Allow-Method', 'POST');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

                stb_socket.on('message', function(message) {
                    console.log('received from stb ws: %s', message);
                    res.end(message);
                });

                stb_socket.send(data);
            }else{
                res.end('');
            }
        });

    }else if (req.method === "OPTIONS" && req.url === "/invoke"){

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Method', 'POST');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.end('');
    }
}).listen(8102);