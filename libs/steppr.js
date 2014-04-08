var request = require('request')
,	 connection = require('./mongo_connection.js')
,   moment = require('moment')
,   dotenv = require('dotenv')
,   user = require('./user.js')
,   fs = require('fs')
,   Log = require('log')
,   log = new Log('debug', fs.createWriteStream('logs/libs-steppr-log.txt', {"flags": "a"}));

dotenv.load();

function delimitNumbers(str, callback) {
	return (str + "").replace(/\b(\d+)((\.\d+)*)\b/g, function(a, b, c) {
			return (b.charAt(0) > 0 && !(c || ".").lastIndexOf(".") ? b.replace(/(\d)(?=(\d{3})+$)/g, "$1,") : b) + c;
	});
}

module.exports = {
	// returns totalStepsToday, totalSteps, usersToday
	stats : function(callback) {
		var now = moment()
		,   today = now.format("YYYY-MM-DD");
		var payload = {
			totalStepsToday : 0,
			totalSteps : 0,
			usersToday : 0,
		}
		connection(function(db) {
			if (!db) return callback(new Error + ' unable to connect to db');
			db.collection('steps').find({date: today}).each(function(err, stepsToday) {
				if (err) return callback( err );
				// loops through each, the last collection from mongo returns null. Hence checking for nostepstoday
				if (stepsToday) {
					payload.usersToday += 1;
					payload.totalStepsToday += stepsToday.steps
				}
				if (!stepsToday) {
					db.collection('steps').find({}).each(function(err, totalSteps) {
						if (err) callback( err );
						// last doc is null again. this is how we know we're done.
						if (!totalSteps) {
							payload.totalStepsToday = delimitNumbers(payload.totalStepsToday);
							payload.totalSteps = delimitNumbers(payload.totalSteps);
							payload.usersToday = delimitNumbers(payload.usersToday);
							log.info('stats complete: ', payload);
							callback( null, payload );
						}
						else {
							payload.totalSteps +=  totalSteps.steps;
						}
					})
				}
			})
		})
	},

	// //updates all users steps for today
	updateAllUsers : function(callback) {
		connection(function(db) {
			if (!db) return callback(new Error + ' unable to connect to db');
			var userStepsToday;
			db.collection('users').find({}).each(function(err, doc) {
				if (err) { callback (err) }
				if (doc) {
					var movesId = doc.user
					,   accessToken = doc.access_token;
					log.info(movesId, accessToken)
					user.updateUser(accessToken, movesId, function(err, success) {
						if (err) log.error(err);
					})
				}
				if (!doc) {
					callback(null, 'updateAllUsers complete');
				}
			})
		})
	},

	// updateAllGroups : function(callback) {
	// 	connection(function( db ) {
	// 		if ( !db ) return callback( new Error + ' unable to connect to db' );
	// 		db.collection('groups').find({}).each(function(err, doc) {
	// 			if ( err || !doc ) return callback(err || 'no doc');
	// 			doc.members.forEach(function(member) {
	// 				var members = [];
	// 				if ( !member ) {
	// 					var stepsToday;
	// 					if (members.length > 0) {
	// 						members.forEach(function(member) {
	// 							user.userStepsToday(member.id, function(err, success) {
	// 								console.log(err);
	// 							})
	// 						})
	// 					}
	// 					else {
	// 						// no members in group
	// 					}
	// 				}
	// 				else {
	// 					members.push(member.id);
	// 				}
	// 			})
	// 		})
	// 	})
	// },
}

// 	updateAllGroups : function(callback) {
// 	// // groupStepsToday
// 	// 	// each group in groups coll
// 	// 		// each user in group
// 	// 			// add users steps to groupStepsToday
// 	// 	// totalGroupSteps
// 	// 		// find group in steps coll
// 	// 			// each doc, increase total
// 	// 	// OR
// 	// 		// totalGroupSteps [date]
// 	//
//
//
// 		MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
// 			if (err || !db) callback (err);
// 			else {
// 				db.collection('steps').find()
// 			}
//
// 		})
// 	}
// }
//
//





// loop through steps coll
	// filter by people group with > 0
		// open groups collection filtered by the groups name (making this .. see below groupSteps)
			//loop each user in the group
				// if group.user.id(!== (steps collection)
					// update
			//
		//
	//
//

	//
	//
	//
	//
	//
	// group : {
	// 	name :
	// 	user : {
	// 		id
	// 		steps
	// 	}
	// }
