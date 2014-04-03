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

// 
// var db;
// MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
// 	if (err || !db) callback (err);
//     else {
//         db = db;
//     }
// })
// exports.index = function(req, res) {{
// 	var group = {
// 		this.name : groupName,
// 		this.creator : creator,
// 	}
// 	var k = createGroup("kevin ", "god");
//
// var kevin = createGroup("Kevin", "god");
// console.log(kevin);
//
//
//
//
// }


exports.notification = function(req, res) {
    console.log('incoming notification from moves')
    console.log(req.body);
    res.end();
}
