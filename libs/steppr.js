var request = require('request')
,   moment = require('moment')
,   now = moment()
,   today = now.format("YYYY-MM-DD")
,   MongoClient = require('mongodb').MongoClient
,   dotenv = require('dotenv');
dotenv.load();



module.exports = {
	getTotalSteps : function(callback) {
		var payload = {
			totalStepsToday : 0,
			totalStepsLifetime : 0,
			usersToday : 0,
		}
		MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
			if (err) return callback( err );
			db.collection('steps').find({date: today}).each(function(err, stepsToday) {
				if (err) return callback( err );
				if (!stepsToday) {
					db.collection('steps').find().each(function(err, stepsLifetime) {
						if (err) return callback( err );
						if (!stepsLifetime) {
							console.log(payload);
							callback( null, payload );
						}
						else {
							payload.totalStepsLifetime +=  stepsLifetime.steps;
						}
					})
				}
				else {
					payload.usersToday += 1;
					payload.totalStepsToday += stepsToday.steps;
				}
			})
		})
	}
}
