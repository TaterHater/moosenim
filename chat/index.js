var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql = require('mysql');


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/indexchat.html');
});

io.on('connection', function (socket) {
    console.log('a user connected');
    getMessage(10);
    socket.on('chat message', function (msg) {
        console.log('message: ' + msg);
        io.emit('chat message', msg);
        sendMessage(msg);
    });

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "raspberry",
    database: "moosenim"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");


});

function sendMessage(message) {
    con.query("INSERT INTO messages (message, username, timestamp) VALUES ( ?, 'username', 'time')", [message], function (error, results) {
        if (error) throw error;
    });
}
function getMessage(num) {
    con.query("SELECT * FROM ( SELECT * FROM messages ORDER BY id DESC LIMIT ?) sub ORDER BY  id ASC", [num], function (error, rows, results) {
        console.log("getting messages...");
        if (error) throw error;
        for (var i = 0; i < num; i++) {
            io.emit('last message',rows[i].message);
            console.log(results[i]);
        }
        
    });
}

