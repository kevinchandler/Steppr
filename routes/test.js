var request = require('request')
,   moment = require('moment')
,   now = moment()
,   today = now.format("YYYY-MM-DD")
,   dotenv = require('dotenv')
,   user = require('../libs/user.js')
,   steppr = require('../libs/steppr.js');
dotenv.load();

exports.notification = function(req, res) {
    console.log('incoming notification from moves')
    console.log(req.body);
    res.end();
}

exports.index = function(req, res) {
  var db = req.db;
  req.users.find().toArray(function(err, results) {
    console.log(results);
  })
  db.close();
}
