var request = require('request')
,   moment = require('moment')
,   now = moment()
,   today = now.format("YYYY-MM-DD")
,   MongoClient = require('mongodb').MongoClient
,   dotenv = require('dotenv');
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
				if (err) return callback( err );
				// loops through each, the last collection from mongo returns null. Hence checking for nostepstoday
				if (!stepsToday) {
					db.collection('steps').find().each(function(err, stepprSteps) {
						if (err) return callback( err );
						// last doc is null again. this is how we know we're done.
						if (!stepprSteps) {
							console.log(payload);
							db.close();
							return callback( null, payload );
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
	}
}
