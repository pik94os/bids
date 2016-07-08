var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser'),
    passport = require('passport'),
    passportSocketIo = require("passport.socketio"),
    redis = require('redis'),
    socketRedis = require('socket.io-redis'),
    session = require('express-session'),
    redisStore = require('connect-redis')(session),
    flash = require("connect-flash"),
    LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var socket_io  = require( "socket.io" );
var client = redis.createClient();
var checkAuth = require('./middlewares/check-auth.js');



var Model = require('./models');
//
// var routes = require('./routes/index');
var users = require('./routes/users');
var upload = require('./routes/upload');

// Express
var app          = express();

// Socket.io
var io           = socket_io();

io.adapter(socketRedis({ host: 'localhost', port: 6379, client: client }));
io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,       // the same middleware you registrer in express
  key:          'express.sid',       // the name of the cookie where express/connect stores its session_id
  secret:       'sey3ui97Il gh0W_pct',    // the session_secret to parse the cookie
  store:        new redisStore({ host: 'localhost', port: 6379, client: client }),        // we NEED to use a sessionstore. no memorystore please
  success:      onAuthorizeSuccess,  // *optional* callback on success - read more below
  fail:         onAuthorizeFail,     // *optional* callback on fail/error - read more below
}));

app.io           = io;

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },function(username, password, done) {
      Model.User.findOne({
        where: {
          'username': username
        }
      }).then(function (user) {
        if (user == null) {
          return done(null, false, { message: 'Incorrect credentials.' })
        }

        var hashedPassword = password;//bcrypt.hashSync(password, user.salt)

        if (user.password === hashedPassword) {
          return done(null, user)
        }

        return done(null, false, { message: 'Incorrect credentials.' })
      })
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });


passport.deserializeUser(function(id, done) {
   Model.User.findOne({
        where: {
          'id': id
         }
    }).then(function (user){
       done(null, user);
    });
  });
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(flash());
app.use(session({
  cookieParser: cookieParser,
  key: 'express.sid',
  store: new redisStore({ host: 'localhost', port: 6379, client: client }),
  secret: 'sey3ui97Il gh0W_pct',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/api/users', users);
app.use('/api/upload', upload);
// app.use(checkAuth);
app.use(express.static(path.join(__dirname, '../public')));
app.use(function(req,res){
  res.sendFile(path.join(__dirname, '../public/index.html'));
});
// app.use('/', routes);

var ioHandlers = require('./sockets')(io,passportSocketIo);

module.exports = app;


function onAuthorizeSuccess(data, accept){
  console.log('successful connection to socket.io');
  accept();
}

function onAuthorizeFail(data, message, error, accept){
  console.log('failed connection to socket.io:', message);
  accept();
}