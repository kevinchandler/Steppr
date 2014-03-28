var request = require('request')
,   moment = require('moment')
,   now = moment()
,   today = now.format("YYYY-MM-DD")
,   MongoClient = require('mongodb').MongoClient
,   dotenv = require('dotenv')
,   user = require('../libs/user.js');

dotenv.load();
// libs
var steppr = require('../libs/steppr.js');




exports.index = function(req, res) {

    // user.updateAllUsers(function(err, success) {
    //     console.log(success);
    // })
    //

    // user.updateUser('H9qW98vb5RTuuUb2dwKhQt56I9qCNbn6NL2CRWsNJOAcw6mSNOoKc3U8M04wyc4F', '14104144053355464', function(err, success) {
    //     if (err) console.log(err);
    //     console.log(success);
    // })

    steppr.updateAllUsers(function(err, success) {
        if (err) console.log(err);
        console.log(success);
    })


}


exports.notification = function(req, res) {
    console.log('incoming notification from moves')
    console.log(req.body);
    res.end();
}
