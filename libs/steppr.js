var request = require('request')
,   moment = require('moment')
,   now = moment()
,   today = now.format("YYYY-MM-DD")
,   MongoClient = require('mongodb').MongoClient
,   dotenv = require('dotenv')
,   user = require('./user.js');
dotenv.load();




module.exports = {

	// { // sample output
	//   "totalStepsToday": 4255,
	//   "totalStepprSteps": 10713,
	//   "usersToday": 1
	// }
	getTotalSteps : function(callback) {
		var payload = {
			totalStepsToday : 0,
			totalStepprSteps : 0,
			usersToday : 0,
		}

		MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
			if (err) return callback( err );

			db.collection('steps').find({date: today}).each(function(err, stepsToday) {
				if (err) callback( err );
				// loops through each, the last collection from mongo returns null. Hence checking for nostepstoday
				if (!stepsToday) {
					db.collection('steps').find().each(function(err, stepprSteps) {
						if (err) callback( err );
						// last doc is null again. this is how we know we're done.
						if (!stepprSteps) {
							console.log(payload);
							callback( null, payload );
						}
						else {
							payload.totalStepprSteps +=  stepprSteps.steps;
						}
					})
				}
				else if (stepsToday) {
					payload.usersToday += 1;
					payload.totalStepsToday += Number(stepsToday.steps);
				}
				else {
					callback('error getTotalSteps')
				}
			})
		})
	},


	// //updates all usesr steps for today
	updateAllUsers : function(callback) {
		MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
			if (err || !db) callback( err );
			var userStepsToday;

			db.collection('users').find({}).each(function(err, doc) {
				if (err) { callback (err) }
				if (doc) {
					console.log(doc);
					var movesId = doc.user
					,   accessToken = doc.access_token;

					user.updateUser(accessToken, movesId, function(err, success) {
						if (err) console.log(err);
						console.log(success);
					})
				}
				if (!doc) {
					callback(null, 'updateAllUsers complete');
				}
			})
		})
	}
	// 	checkForUser : function(callback) {
	//
	// 	}
	// }
}
