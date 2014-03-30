var request = require('request')
,   moment = require('moment')
,   now = moment()
,   today = now.format("YYYY-MM-DD")
,   MongoClient = require('mongodb').MongoClient
,   dotenv = require('dotenv')
,   user = require('./user.js')
,   fs = require('fs')
,   Log = require('log')
,   log = new Log('debug', fs.createWriteStream('logs/libs-steppr-log.txt', {"flags": "a"}));

dotenv.load();




module.exports = {

	findUser : function(userId, callback) {
		MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
			if (err) return callback( err );
			db.collection('users').findOne({user: userId}, function(err, doc) {
				if (err) return callback(err);
				if (doc) {
					log.info('findUser complete: ', doc);
					callback(null, doc);
				}
				else if (!doc) {
					log.error('findUser: no doc found')
					callback(null);
				}
			})
		})
	},

	createNewUser : function(accessToken, refreshToken, movesId, callback) {
		MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
			if (err) return callback( err );
			var  placeholder = '';
			db.collection('users').insert({
				user: movesId,
				username: placeholder,
				email: placeholder,
				stepsToday : 0,
				stepsTotal : 0,
				points: {
					total: 0
				},
				badges: ['Alpha Tester'],
				groups: [],
				access_token : accessToken,
				refresh_token : refreshToken,
			}, function(err, success) {
				if (err) {
					log(err);
					callback(err);
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

		MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
			if (err) return callback( err );
			db.collection('steps').find({date: today}).each(function(err, stepsToday) {
				console.log('today is: ' + today);
				if (err) callback( err );
				// loops through each, the last collection from mongo returns null. Hence checking for nostepstoday
				if (!stepsToday) {
					db.collection('steps').find({}).each(function(err, totalSteps) {
						if (err) callback( err );
						// last doc is null again. this is how we know we're done.
						if (!totalSteps) {
							log.error('getTotalSteps complete: ', payload);
							console.log(payload);
							return callback( null, payload );
						}
						else {
							payload.totalSteps +=  totalSteps.steps;
						}
					})
				}
				if (stepsToday) {
					payload.usersToday += 1;
					payload.totalStepsToday += stepsToday.steps
				}
			})
		})
	},

	// //updates all usesr steps for today
	updateAllUsers : function(callback) {
		MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
			if (err) callback( err );
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
				callback(err)
			}
		})
	}
}
