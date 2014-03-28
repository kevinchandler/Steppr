var request = require('request')
,   moment = require('moment')
,   now = moment()
,   today = now.format("YYYY-MM-DD")
,   MongoClient = require('mongodb').MongoClient
,   dotenv = require('dotenv')
,   user = require('./user.js');
dotenv.load();




module.exports = {


	findUser : function(userId, callback) {
		MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
			if (err) return callback( err );
			db.collection('users').findOne({user: userId}, function(err, doc) {
				if (err) return callback(err);
				if (doc) {
					callback(null, doc);
				}
				else if (!doc) {
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
				name: placeholder,
				state : placeholder,
				zipcode: placeholder,
				stepsToday : 0,
				stepsTotal : 0,
				points: {
					total: 0
				},
				badges: [],
				groups: [],
				access_token : accessToken,
				refresh_token : refreshToken,
			}, function(err, success) {
				if (err) {
					res.send(err);
				}
				if (success) {
					console.log('user registered successfully');
					callback(null, success);
				}
			})
		})
	},

	// checks steps collection for today's date and returns the sum of each documents steps
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
}
