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
  user.getLocale('Phef4mM8Pb280_X2QxFXm699zTO5XqFN8PdU9504qI43ATVEA98584Y501cgOlZg', '14104144053355464', function(err, success) {
    if (err) {
      console.log('EERRRROROR');
      console.log(err);
    }
    console.log(success);
  })
}
