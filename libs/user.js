var request = require('request')
,   moment = require('moment')
,   now = moment()
,   today = now.format("YYYY-MM-DD")
,   MongoClient = require('mongodb').MongoClient
,   dotenv = require('dotenv');
dotenv.load();

module.exports = {
	// inputs steps into db if not already in, updates if steps don't match what's in db
	updateUser : function ( sessionToken, movesId ) {
		if (!sessionToken || !movesId) {
			return res.redirect('/');
		}
		else { // user is authenticated and logged in
			console.log('updating user ' + movesId);
			request('https://api.moves-app.com/api/1.1/user/activities/daily?pastDays=1&access_token='+sessionToken, function(err, response, body) {
				console.log('req');
				if (err) return err;
				var payload = JSON.parse(body);
				if (payload) { // parsed data from request
					console.log('payload');
					MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
						if (err) {
							return err;
						}
							// each of the 31 days retrieved from moves api, check to see if it's in the db, if so, make sure the # of steps match, update if not.
							payload.forEach(function(moves_data) {
							if (!moves_data.summary) {
								return null;
							}
							moves_data.summary.forEach(function(activity) {
								if (activity.steps) {
									// format date from 20140201 -> 2014-02-01
									var activityDate = moment(moves_data.date, "YYYYMMDD").format("YYYY-MM-DD")
									,   steps = activity.steps;

									// checks to see if there's already a document in the db with the date from moves,
									// updates db with # of steps from moves
									var query = { user : movesId, date : activityDate };
									db.collection('steps').findOne(query, function(err, doc) {
										if (err) return err;
										if (doc) { // if this date is in the db
											if (doc.steps !== steps) { // updates user's steps in db if it differs
												db.collection('steps').update({_id: doc._id}, {$set: { 'steps' : steps}}, function(err, success) {
													if (err) return err;
													else if (success) {
														console.log('Steps updated from ' + doc.steps + ' -> ' + steps + ': ' + doc.date + '\n');
													}
												})
											}
										}
										if (!doc) {
										    // no data found for this date in our db, save it
											db.collection('steps').insert({
												"user"  : movesId,
												"date"  : activityDate,
												"steps" : steps,
												"last_updated" : today,
											}, function(err, success){
												if (err) { return err; }
												console.log( 'Data entered into db: ' + movesId, activityDate, steps );
											})
										}
									})
								}
								else { //no activity steps
									return;
								}
							})
						})
					})
				} //if payload
				else {
					return;
				}
			})
		}
	},
	// gets the user and returns. Used to get the users steps for today
	steps : function (movesId, callback) {
		MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
			if (err) return callback( err );
			var query = { user : movesId, date : today };
			db.collection('steps').findOne(query, function(err, data) {
				if (err) return callback( err );
				if (data) {
					callback( null, data );
				}
			})
		})
	}
}
