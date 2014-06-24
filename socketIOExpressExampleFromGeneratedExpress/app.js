var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

//var app = new express()
//, server = require('http').createServer(app)//.listen(3000)
//, io = require('socket.io').listen(server);//(server);//.listen(server);

//http://socket.io/docs/#using-with-express-3/4
//var app = require('express')();
var app = new express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

io.on('connection', function (socket) {
    socket.emit('news', {hello: 'world' });
    socket.on('my other event', function (data) { console.log(data);});
});

//server.listen(3000); //gives error bc address already in use.
server.listen();
//app.listen(); //this would then listen on the express app and not the http server. we need to listen on the http server so we can serve the socket data.

module.exports = app;
