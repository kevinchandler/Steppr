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
  //
  // groups.updateGroup("Hackers", function(err, success) {
  //   if(err) {
  //     console.log(err);
  //   }
  //
  //   console.log(success);
  // })


  steppr.updateAllGroups(function(err, groupSteps) {
    console.log(err);
    // if (err || !groupSteps) return (err || 'failed to updateGroup');
    console.log(groupSteps);
  })
}
