
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes')
,   api = require('./api/api.js')
,	 connection = require('./libs/mongo_connection.js')
,   moves = require('./routes/moves.js')
,   dashboard = require('./routes/dashboard.js')
,   user = require('./libs/user.js')
,   groups = require('./routes/groups.js')
,   test = require('./routes/test.js')
,   steppr = require('./libs/steppr.js')
var http = require('http');
var path = require('path');
var fs = require('fs');
var app = express();
var dotenv = require('dotenv');
dotenv.load();

app.use(function(req, res, next){
  connection(function(db) {
    if (!db) return new Error;
    req.db = db;
    // req.users = db.collection('users');
    // req.steps = db.collection('steps');
    // req.groups = db.collection('groups');
    next();
  });
});


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.cookieSession({ secret: process.env.COOKIE_SESSION ||  'meow' }));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public/app')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

if (process.argv[2])  {
    process.env.NGROK_SUBDOMAIN = process.argv[2];
    process.env.NGROK_URL = "http://"+process.argv[2]+".ngrok.com"
    process.env.MOVES_REDIRECT_URL = "http://"+process.argv[2]+".ngrok.com/moves/auth"
    var ngrok = require('ngrok');
    ngrok.connect({
        subdomain: process.env.NGROK_SUBDOMAIN,
        authtoken: process.env.NGROK_TOKEN,
        port: app.get('port')
    }, function(err, url) {
        if (err) throw err;
        console.log('Remote url: ' + url);
    });
}

function authenticate(req, res, next) {
    if (!req.session._token && req.session._movesId) {
      return res.redirect('/#');
    }
    else {
      next();
    }
}

app.get('/login', routes.login);
app.get('/moves', moves.index);
app.get('/moves/auth', moves.authenticate);

app.get('/logout', function(req, res) {
  console.log(req.session);
  req.session._token = null;
  req.session.movesId = null;
  console.log(req.session);
  res.redirect('/')
})


app.get('/groups', groups.index);
app.get('/groups/create', user.createGroup);
app.post('/groups/create', user.createGroup);
app.get('/groups/join/:groupName', groups.joinGroup);
app.get('/groups/leave/:groupName', groups.leaveGroup);
app.get('/groups/:group', groups.showGroup);

app.post('/notification', test.notification); // moves posts data every so often

app.get('/test', test.index);


// API
app.post('/api/v0/stats', api.stats);
app.get('/api/v0/users/me', api.getSelf);
app.get('/api/v0/users/me/update', api.updateUser);
app.get('/api/v0/users/:username', api.viewUser);
app.get('/api/v0/user_today', api.userStepsToday); // takes user movesId as 1st param
app.get('/api/v0/groups', api.viewAllGroups);
app.get('/api/v0/groups/:group', api.showGroup);

app.post('/api/v0/users/register', api.registerUser);
app.get('/api/v0/groups/join/:group', api.joinGroup);
app.post('/api/v0/groups/leave/:group', api.leaveGroup);
app.post('/api/v0/groups/create/:group', api.createGroup);

app.post('/api/v0/challenge', api.challengeUser);

function updateAllUsers() {
    steppr.updateAllUsers(function(err, success) {
        if (err) console.log(err);
        return success;
    })
}

function updateAllGroups() {
  steppr.updateAllGroups(function(err, success) {
    if (err) console.log(err);
    return success;
  })
}

//will run updateAllUsers() every so often // what the minutes variable is set to
var minutes = 6, the_interval = minutes * 60 * 1000;
setInterval(function() {
  updateAllUsers();
  updateAllGroups();
}, the_interval);

connection(function(db) {
  if (!db) return callback(new Error + ' unable to connect to db');
  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });
})
