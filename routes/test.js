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

  db.collection('groups').update({name:"Hackers"},{$pull:{
    members: {
      id:14104144053355464,
      username: 'Kevin',
    }
  }},
  function(err, success) {
    if (err || !success) {
      console.log('failed');
    }
    else {
      console.log('success');
    }
  })
}
