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

    database.connectToDb(function(err, db) {
        if (err) console.log(err);
        else {
            db.collection('users').find({}).each(function(err, doc) {
                console.log(doc);
            })
        }
    })
}


exports.notification = function(req, res) {
    console.log('incoming notification from moves')
    console.log(req.body);
    res.end();
}
