var request = require('request')
,   moment = require('moment')
,   now = moment()
,   today = now.format("YYYY-MM-DD")
,   MongoClient = require('mongodb').MongoClient
,   dotenv = require('dotenv');
dotenv.load();



exports.index = function(req, res) {
    // MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
    //     if (err) {
    //         throw err;
    //     }
    //     db.collection('steps').findOne({ user: movesId, date: today }, function(err, userActivity) {
    //         if (err) { return err };
    //         return(userActivity);
    //     })
    // })
    res.render('test');
}


exports.notification = function(req, res) {
    console.log('incoming notification from moves')
    console.log(req.body);
    res.end();
}
