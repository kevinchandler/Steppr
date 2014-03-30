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
    console.log('finding grop');
    user.findGroup({_id: "53379ebea1fff451fa02bbfc"}, function(err, group) {
        if (err)  {
            log.error(err);
            log.error('error joining group');
            res.redirect('back');
        }
        if (!group) {
            // user is in a group already
            console.log(group);
        }
        if (group) {
            console.log(group);
            // user joined successfully
        }
    })
}


exports.notification = function(req, res) {
    console.log('incoming notification from moves')
    console.log(req.body);
    res.end();
}
