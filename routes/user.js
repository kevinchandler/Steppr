var request = require('request')
,	 connection = require('../libs/mongo_connection.js')
,   moment = require('moment')
,   dotenv = require('dotenv')
,   fs = require('fs')
,   Log = require('log')
,   log = new Log('debug', fs.createWriteStream('log.txt'));

dotenv.load();


// register user info with moves id, their email, create db schema
exports.register = function(req, res) {
  var db = req.db;
  if (req.method === 'GET') {
      res.render('register.jade');
  }
  if (req.method === 'POST') {
    var user = req.session._movesId
    ,   username = req.body.username;

    if (!user || !username) {
        log.error('user registration lacks user or username')
        return res.redirect('back');
    }
    else {
      connection(function(db) {
        if (!db) return callback(new Error + ' unable to connect to db');
        else {
          db.collection('users').update({ user : user }, { $set: { "username" : username }}, function(err, success) {
            if (err) { log.error(err); return res.redirect('back'); }
            if (success) {
                log.info( success, 'username set: ' + username, user );
                console.log('username successfully set: ', user, username );
                res.redirect('/groups');
            }
          })
        }
      })
    }
  }
}
