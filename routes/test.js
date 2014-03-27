var request = require('request')
,   moment = require('moment')
,   now = moment()
,   today = now.format("YYYY-MM-DD")
,   MongoClient = require('mongodb').MongoClient
,   dotenv = require('dotenv');

dotenv.load();
// libs
var steppr = require('../libs/steppr.js');




exports.index = function(req, res) {
    //
    // var steps;
    //
    steppr.getTotalSteps(function(err, steps){
        console.log('stepsssss is: ' + steps.totalStepsToday);
    })

    // MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
    //     if (err) return err;
    // request('https://api.moves-app.com/api/1.1/user/activities/daily?pastDays=1&access_token='+req.session._token, function(err, response, body) {
    //     body = JSON.parse(body);
    //     res.json(body);
    //
    // })




}


exports.notification = function(req, res) {
    console.log('incoming notification from moves')
    console.log(req.body);
    res.end();
}
