var request = require('request')
,   moment = require('moment')
,   now = moment()
,   today = now.format("YYYY-MM-DD")
,   dotenv = require('dotenv')
,   user = require('../libs/user.js')
,   steppr = require('../libs/steppr.js')
,   groups = require('../libs/groups.js');
dotenv.load();

exports.notification = function(req, res) {
    console.log('incoming notification from moves')
    console.log(req.body);
    res.end();
}

exports.index = function(req, res) {
  user.userStepsToday('14104144053355464', '2014-04-12', function(err, success) {
    console.log(err);
    console.log(success);
    return res.end(success);
  })
}
