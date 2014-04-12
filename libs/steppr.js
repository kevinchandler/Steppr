var request = require('request')
,	 connection = require('./mongo_connection.js')
,   moment = require('moment')
,   dotenv = require('dotenv')
,   user = require('./user.js')
,	 groups = require('./groups.js')
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
	stats : function(today, callback) {
		var payload = {
			stepsToday : 0,
			stepsTotal : 0,
			usersToday : 0,
		}
		connection(function(db) {
			if (!db) return callback(new Error + ' unable to connect to db');
			db.collection('steps').find({ date: today }).each(function(err, stepsToday) {
				if (err) return callback( err );
				// loops through each, the last collection from mongo returns null. Hence checking for nostepstoday
				if (stepsToday) {
					payload.usersToday += 1;
					payload.stepsToday += stepsToday.steps
				}
				if (!stepsToday) {
					db.collection('steps').find({}).each(function(err, stepsTotal) {
						if (err) callback( err );
						// last doc is null again. this is how we know we're done.
						if (!stepsTotal) {
							payload.stepsToday = delimitNumbers(payload.stepsToday);
							payload.stepsTotal = delimitNumbers(payload.stepsTotal);
							payload.usersToday = delimitNumbers(payload.usersToday);
							log.info('stats complete: ', payload);
							callback( null, payload );
						}
						else {
							payload.stepsTotal +=  stepsTotal.steps;
						}
					})
				}
			})
		})
	},

	// //updates all users steps for today: user.updateUser()
	updateAllUsers : function(callback) {
		connection(function(db) {
			if (!db) return callback(new Error + ' unable to connect to db');
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
	}
}
