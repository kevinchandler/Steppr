
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes')
,   moves = require('./routes/moves.js')
,   dashboard = require('./routes/dashboard.js')
,   user = require('./routes/user.js')
,   groups = require('./routes/groups.js')
,   test = require('./routes/test.js')
,   steppr = require('./libs/steppr.js')
,   USER = require('./libs/user.js');
var http = require('http');
var path = require('path');
var fs = require('fs');
var app = express();
var dotenv = require('dotenv');
dotenv.load();

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
app.use(express.static(path.join(__dirname, 'public')));

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
    if (req.session._token && req.session._movesId) {
        next();
    }
    else {
        res.redirect('/');
    }
}


app.get('/', routes.index);

app.get('/moves', moves.index);
app.get('/moves/auth', moves.authenticate);

app.get('/home', authenticate, dashboard.home);

app.get('/user/register', user.register);
app.post('/user/register', user.register);

app.get('/groups', groups.index);
app.get('/groups/create', groups.createGroup);
app.post('/groups/create', authenticate, groups.createGroup);
app.get('/groups/join/:groupName', authenticate, groups.joinGroup);
app.get('/groups/leave/:groupName', authenticate, groups.leaveGroup);
app.get('/groups/:groupName', groups.viewGroup);


// app.get('/test', test.index);

app.post('/notification', test.notification); // moves posts data every so often

app.get('/logs', function(req, res) {
      res.sendfile('log.txt');
})


function updateAllUsers() {
    steppr.updateAllUsers(function(err, success) {
        if (err) console.log(err);
        console.log(success);
    })
}

//will run updateAllUsers() every so often // what the minutes variable is set to
var minutes = 5, the_interval = minutes * 60 * 1000;
setInterval(function() {
    console.log('Updating: \n');
  updateAllUsers();
}, the_interval);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
