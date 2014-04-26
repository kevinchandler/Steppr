var request = require('request')
,	 connection = require('./mongo_connection.js')
,   moment = require('moment')
,   dotenv = require('dotenv')
,   user = require('./user.js')
,	 groups = require('./groups.js')
,   fs = require('fs')
,   Log = require('log')
,   log = new Log('debug', fs.createWriteStream('logs/log.txt', {"flags": "a"}));


dotenv.load();

function delimitNumbers(str, callback) {
	return (str + "").replace(/\b(\d+)((\.\d+)*)\b/g, function(a, b, c) {
			return (b.charAt(0) > 0 && !(c || ".").lastIndexOf(".") ? b.replace(/(\d)(?=(\d{3})+$)/g, "$1,") : b) + c;
	});
}

module.exports = {
	// data about each user, returning stepsToday, stepsTotal, usersToday
	stats : function(today, callback) {
		var payload = {
			stepsToday : 0,
			stepsTotal : 0,
			usersToday : 0,
		}
		connection(function(db) {
			if (!db) return callback(new Error + ' unable to connect to db');
			db.collection('users').find().each(function(err, user) {
				if (err) return callback( err );
				// loops through each, the last collection from mongo returns null. Hence checking for nostepstoday
				if (user) {
					if (user.steps) {
						payload.usersToday += 1;
						payload.stepsToday += user.steps.today
						// iterate users past days steps to get their total steps
						for (var i = 0; i < user.steps.daily.length; i++) {
							payload.stepsTotal += user.steps.daily[i].steps;
						}
						payload.stepsTotal += user.steps.today; // we got previous days' steps, now lets add todays steps to the total
					}
				}
				if (!user) { // end of mongodb collection
					payload.stepsToday = delimitNumbers(payload.stepsToday);
					payload.stepsTotal = delimitNumbers(payload.stepsTotal);
					payload.usersToday = delimitNumbers(payload.usersToday);
					log.info('stats complete: ', payload);
					callback( null, payload );
				}
			})
		})
	},


	// returns username, stepsToday, location
	// to be used on landing page to show activity list
	activityToday : function(today, callback) {
		if (!today) { return callback( new Error )}
		connection(function(db) {
			if (!db) return callback(new Error + ' unable to connect to db');
			db.collection('users').find({}, { user: 1, username: 1, 'steps': 1, 'info': 1 }).toArray(function(err, usersArr){
				if (err) { return callback (err) }
				if ( usersArr.length === 0 ) {
					return callback('no users to grab');
				}
				if ( usersArr ) {
					// remove any users with 0 stepsToday before sending to the client
					for (var i = 0; i < usersArr.length; i++) {
						if (usersArr[i] && usersArr[i].steps.today === 0) {
							usersArr.splice(i, 1);
						}
						else {
							usersArr[i].steps.today = delimitNumbers(usersArr[i].steps.today);
						}
					}
					callback(null, usersArr);
				}
			})
		})
	},

	// //updates all users steps for today: user.updateUser()
	updateAllUsers : function(callback) {
		connection(function(db) {
			if (!db) return callback(new Error + ' unable to connect to db');
			db.collection('users').find({}).each(function(err, doc) {
				if (err) { return callback (err) }
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

	// updates all groups steps for today: groups.updateGroup()
	updateAllGroups : function(callback) {
		connection(function(db) {
			if (!db) return callback(new Error + ' unable to connect to db');
			db.collection('groups').find().each(function(err, group) {
				if (group) {
					groups.updateGroup(group.name, function(err, success) {
						if (err) callback(err);
					})
				}
				else {
					callback(null, 'updateAllGroups complete')
				}
			})
		})
	},

	// userChallenge : function(callback) {
	// 	connection(function(db) {
	// 		if (!db) return callback(new Error + ' unable to connect to db');
	// 		// just returns challenging object of document
	// 		db.collection('users').find({}, { challenging: 1 }).each(function(err, user) {
	// 			if (err) return callback (err);
	// 			else {
	// 				callback(null, userArr);
	// 			}
	// 		});
	// 	})
	// },
}
