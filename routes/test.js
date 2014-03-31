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
    db.close();
}


exports.notification = function(req, res) {
    console.log('incoming notification from moves')
    console.log(req.body);
    res.end();
}
