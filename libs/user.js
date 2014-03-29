var request = require('request')
,   moment = require('moment')
,   now = moment()
,   today = now.format("YYYY-MM-DD")
,   MongoClient = require('mongodb').MongoClient
,   dotenv = require('dotenv');
dotenv.load();

module.exports = {

	updateUser : function (accessToken, movesId, callback) {

	//	 gets each day of moves activity for pastDays in the request query
	//		 loops each of them and checks to see if that date is in the database
	//			 if so it will update the number of steps if different than what moves tells us
	//			 if not it will save to db & update stepsToday in the users collection
		console.log('updateUser: ',  accessToken, movesId + '\n');
		if (!accessToken || !movesId) {
			return callback('err');
		}
		request('https://api.moves-app.com/api/1.1/user/activities/daily?pastDays=1&access_token='+accessToken, function(err, response, body) {
			var payload = JSON.parse(body);
			if (err) return err;
			else if (!body) {
				callback(err)
			}
			if (payload) { // parsed data from request
				MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
					if (err) {
						callback(err);
					}
					// each of the days retrieved from moves api, check to see if it's in the db, if so, make sure the # of steps match, update if not.
					payload.forEach(function(moves_data) {
						if (!db) {
							callback(err +' \n no db -- updateUser: payload.forEach')
						}
						if (!moves_data || !moves_data.summary) {
							console.log('no moves data summary');
							callback(null, undefined);
						}
						moves_data.summary.forEach(function(activity) {
							if (!db) {
								callback(err +' \n no db -- updateUser: payload.forEach')
							}
							if (activity.steps) {
								// format date from 20140201 -> 2014-02-01
								var activityDate = moment(moves_data.date, "YYYYMMDD").format("YYYY-MM-DD")
								,   steps = activity.steps;

								// checks to see if there's already a document in the db with the date from moves,
								// updates db with # of steps from moves
								var query = { user : movesId, date : activityDate };
								db.collection('steps').findOne(query, function(err, doc) {
									if (err) callback(err);
									if (!doc) {
										console.log('No data for ' + today + ' found, inserting: ');
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
									// update users doc w/ # of steps today
									if (doc && activityDate === today) {
										db.collection('users').update({user: doc.user}, {$set: { "stepsToday" : steps}}, function(err, success) {
											if (err) callback(err);
											else if (success) {
												db.collection('steps').update({_id: doc._id}, {$set: { 'steps' : steps}}, function(err, success) {
													if (err) callback(err);
													if (success) {
														console.log('Steps Collection: Steps updated from ' + doc.steps + ' -> ' + steps + ': ' + doc.date + '\n');
													}
												})
											}
										})
									}
								})
							}
						})
					})
					// we're done checking/updating db
					callback(null, 'updateUser complete');
				})
			}
		})
	},
	// gets the user and returns. Used to get the users steps for today
	steps : function(movesId, callback) {
		console.log('FFFFFFFFFF');
		console.log('inside user.steps: ' + movesId);
		MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
			if (err) callback( err, null );
			var query = { user : movesId, date : today };
			db.collection('steps').findOne(query, function(err, data) {
				console.log(data);
				if (err) {
				     callback( err );
				}
				if (data) {
					 callback( null, data );
				}
			})
		})
	}
}
