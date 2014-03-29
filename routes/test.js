var request = require('request')
,   moment = require('moment')
,   now = moment()
,   today = now.format("YYYY-MM-DD")
,   MongoClient = require('mongodb').MongoClient
,   dotenv = require('dotenv')
,   user = require('../libs/user.js')
,   database = require('../libs/database.js')
,   steppr = require('../libs/steppr.js');

dotenv.load();






exports.index = function(req, res) {
    console.log(req.session._movesId);
    user.isRegistered(req.session._movesId, function(err, success) {
        if (err) console.log(err);
        if (success) {
            console.log('user exists');
        }
        else if (!success) {
            res.redirect('/user/register');
        }
    })
}


exports.notification = function(req, res) {
    console.log('incoming notification from moves')
    console.log(req.body);
    res.end();
}
