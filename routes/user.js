var request = require('request')
,   moment = require('moment')
,   now = moment()
,   today = now.format("YYYY-MM-DD")
,   database = require('../libs/database.js')
,   dotenv = require('dotenv')
,   fs = require('fs')
,   Log = require('log')
,   log = new Log('debug', fs.createWriteStream('log.txt'));

dotenv.load();


// register user info with moves id, their email, create db schema
exports.register = function(req, res) {
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
            database.connect(function(err, db) {
                var users = db.collection('users');
                ///db.collection('users').update({user: doc.user}, {$set: { "stepsToday" : steps}}, function(err, success) {

                if (db) {
                    users.update({ user : user }, { $set: { "username" : username }}, function(err, success) {
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
