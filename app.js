
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes')
,   moves = require('./routes/moves.js')
,   dashboard = require('./routes/dashboard.js')
,   user = require('./routes/user.js')
,   groups = require('./routes/groups.js')
,   test = require('./routes/test.js');
var http = require('http');
var path = require('path');

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
app.use(express.cookieParser());
app.use(express.cookieSession({ secret: 'cats ¡12333333222222sqgdddaods dfadsm!!@$!#%@%%@w%#dmeow meow' }));
app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
// if ('development' == app.get('env')) {
//   app.use(express.errorHandler());
// }
//
// if (process.argv[2])  {
//     process.env.NGROK_SUBDOMAIN = process.argv[2];
//     process.env.NGROK_URL = "http://"+process.argv[2]+".ngrok.com"
//     process.env.MOVES_REDIRECT_URL = "http://"+process.argv[2]+".ngrok.com/moves/auth"
//     var ngrok = require('ngrok');
//     ngrok.connect({
//         subdomain: process.env.NGROK_SUBDOMAIN,
//         authtoken: process.env.NGROK_TOKEN,
//         port: app.get('port')
//     }, function(err, url) {
//         if (err) throw err;
//         console.log('Remote url: ' + url);
//     });
// }

app.get('/', routes.index);

app.get('/moves', moves.index);
app.get('/moves/auth', moves.authenticate);


app.get('/home', dashboard.home);

app.get('/user/register', user.register);
app.post('/user/register', user.register);

app.get('/groups', groups.index);
app.post('/groups/create', groups.createGroup);

app.get('/test', test.index);

app.post('/notification', test.notification); // moves posts data every so often

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
