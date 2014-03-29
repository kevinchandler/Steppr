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
    user.isRegistered(req.session._movesId, function(err, isRegistered) {
        if (err) {
            log.error(err);
            res.redirect('back');
        }
        if (isRegistered) {
            res.redirect('/groups');
        }
        else if (!isRegistered) {
            res.redirect('/user/register');
        }
    })
}


exports.notification = function(req, res) {
    console.log('incoming notification from moves')
    console.log(req.body);
    res.end();
}
