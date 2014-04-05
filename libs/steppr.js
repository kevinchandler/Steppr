var request = require('request')
,	 connection = require('./mongo_connection.js')
,   moment = require('moment')
,   now = moment()
,   today = now.format("YYYY-MM-DD")
,   dotenv = require('dotenv')
,   user = require('./user.js')
,   fs = require('fs')
,   Log = require('log')
,   log = new Log('debug', fs.createWriteStream('logs/libs-steppr-log.txt', {"flags": "a"}));

dotenv.load();

module.exports = {

	findUser : function(userId, callback) {
		connection(function(db) {
			if (!db) return callback(new Error + ' unable to connect to db');
			db.collection('users').findOne({user: userId}, function(err, doc) {
				if (err) return callback(err);
				if (doc) {
					log.info('findUser complete: ', doc);
					callback(null, doc);
				}
				else if (!doc) {
					log.error('findUser complete: no doc found')
					callback(null);
				}
			})
		})
	},

	// this is called after user authenticates with moves if user is not already in db
	createNewUser : function(accessToken, refreshToken, movesId, callback) {
		connection(function(db) {
			if (!db) return callback(new Error + ' unable to connect to db');
			var  placeholder = '';
			db.collection('users').insert({
				user: movesId,
				username: '',
				email: '',
				created: today,
				stepsToday : 0,
				stepsTotal : 0,
				points: {
					total: 0
				},
				badges: ['Beta Tester'],
				groups: [],
				access_token : accessToken,
				refresh_token : refreshToken,
			}, function(err, success) {
				if (err) {
					log(err);
					console.log(err, 'unable to create new user');
					return callback(err);
				}
				if (success) {
					log.info('createNewUser: ', success);
					callback(null, success);
				}
			})
		})
	},

	// checks steps collection for today's date and returns the sum of each documents steps
	getTotalSteps : function(callback) {
		var payload = {
			totalStepsToday : 0,
			totalSteps : 0,
			usersToday : 0,
		}

		connection(function(db) {
			if (!db) return callback(new Error + ' unable to connect to db');
			db.collection('steps').find({date: today}).each(function(err, stepsToday) {
				if (err) callback( err );
				// loops through each, the last collection from mongo returns null. Hence checking for nostepstoday
				if (stepsToday) {
					payload.usersToday += 1;
					payload.totalStepsToday += stepsToday.steps
				}
				else if (!stepsToday) {
					db.collection('steps').find({}).each(function(err, totalSteps) {
						if (err) callback( err );
						// last doc is null again. this is how we know we're done.
						if (!totalSteps) {
							log.error('getTotalSteps complete: ', payload);
							console.log(payload);
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
			if (db) {
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
			}
			else {
				callback('err, updateAllUsers');
			}
		})
	},
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
