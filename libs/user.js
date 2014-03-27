var request = require('request')
,   moment = require('moment')
,   now = moment()
,   today = now.format("YYYY-MM-DD")
,   MongoClient = require('mongodb').MongoClient
,   dotenv = require('dotenv');
dotenv.load();

module.exports = {
	// inputs steps into db if not already in, updates if steps don't match what's in db
	updateUser : function (sessionToken, movesId, callback) {
		// else { // user is authenticated and logged in
			console.log('updating user ',  sessionToken, movesId);
			request('https://api.moves-app.com/api/1.1/user/activities/daily?pastDays=1&access_token='+sessionToken, function(err, response, body) {
				if (err) return err;
				var payload = JSON.parse(body);
				if (payload) { // parsed data from request
					console.log('Parsed payload');
					MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
						if (err) {
							callback(err);
							return;
						}
							// each of the 31 days retrieved from moves api, check to see if it's in the db, if so, make sure the # of steps match, update if not.
							payload.forEach(function(moves_data) {
							if (!moves_data.summary) {
								return;
							}
							moves_data.summary.forEach(function(activity) {
								console.log('inside moves_data.forEach: ');
								if (activity.steps) {
									// format date from 20140201 -> 2014-02-01
									var activityDate = moment(moves_data.date, "YYYYMMDD").format("YYYY-MM-DD")
									,   steps = activity.steps;

									// checks to see if there's already a document in the db with the date from moves,
									// updates db with # of steps from moves
									var query = { user : movesId, date : activityDate };
									db.collection('steps').findOne(query, function(err, doc) {
										console.log('inside steps collection. Finding a document with date: ' + activityDate + '\n')
										if (err) callback(err);
										if (doc) { // if this date is in the db
											if (doc.steps !== steps) { // updates user's steps in db if it differs
												db.collection('steps').update({_id: doc._id}, {$set: { 'steps' : steps}}, function(err, success) {
													if (err) callback(err);
													else if (success) {
														console.log('Steps Collection: Steps updated from ' + doc.steps + ' -> ' + steps + ': ' + doc.date + '\n');
													}
												})
												db.collection('users').update({user: doc.user}, {$set: { "stepsToday" : steps}}, function(err, success) {
													if (err) callback(err);
													else if (success) {
														console.log('User Collection: Steps updated from ' + doc.steps + ' -> ' + steps + ': ' + doc.date + '\n');
													}
												})
											}
											else {
												console.log('Nothing to update. Steps in db matches moves-app \n');
												return;
											}
										}
										if (!doc) {
											console.log('No doc found, inserting: ');
										    // no data found for this date in our db, save it
											db.collection('steps').insert({
												"user"  : movesId,
												"date"  : activityDate,
												"steps" : steps,
												"last_updated" : today,
											}, function(err, success){
												if (err) { callback( err ) }
												console.log( 'Data entered into db: ' + movesId, activityDate, steps );
											})
										}
									})
								}
							})
							callback(null, true );
						})
						callback(null, true );
					})
				} //if payload
			})
		// }
		 callback ( null, true );
	},
	// gets the user and returns. Used to get the users steps for today
	steps : function (movesId, callback) {
		MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
			if (err)  return callback( err, null );
			var query = { user : movesId, date : today };
			db.collection('steps').findOne(query, function(err, data) {
				if (err) {
				    return callback( err );
				}
				if (data) {
					return callback( null, data );
				}
			})
		})
	},

	// //updates all usesr steps for today
	// updateAllUsers : function(callback) {
	// 	MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
	// 		if (err)  return callback( err, null );
	// 		var userStepsToday;
	//
	// 		// loop through each user collection, then queries the steps collection with the userid,
	// 		// and updates the user steps collection with the number of steps the user has taken today
	// 		db.collection('users').find({}).each(function(err, user) {
	// 			console.log(user);
	// 			var query = { "user": user.user, date: today }
	// 			db.collection('steps').find(query, function(err, userStepsToday) {
	// 				console.log(userStepsToday);
	// 				// if (err) {
	// 				// 	return callback( err );
	// 				// }
	// 			// 	if (!userSteps) {
	// 			// 		console.log('USER STEPS FOR TODAY IN USER.UPDATEALLUSERS IS: ' + userStepsToday);
	// 			// 		// callback(userStepsToday);
	// 			// 		// update users document with the userStepsToday
	// 			// 	}
	// 			// 	if (userSteps) {
	// 			// 		userStepsToday += userSteps.steps
	// 			// 	}
	// 			})
	// 		})
	// 	})
	// }
}
