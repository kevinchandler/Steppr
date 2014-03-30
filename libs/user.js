var request = require('request')
,   moment = require('moment')
,   now = moment()
,   today = now.format("YYYY-MM-DD")
,   MongoClient = require('mongodb').MongoClient
,   dotenv = require('dotenv')
,   database = require('./database.js')
,   fs = require('fs')
,   Log = require('log')
,   log = new Log('debug', fs.createWriteStream('logs/libs-user-log.txt', {"flags": "a"}));

dotenv.load();

module.exports = {

	updateUser : function (accessToken, movesId, callback) {
	//	 gets each day of moves activity for pastDays in the request query
	//		 loops each of them and checks to see if that date is in the database
	//			 if so it will update the number of steps if different than what moves tells us
	//			 if not it will save to db & update stepsToday in the users collection

		if (!accessToken || !movesId) {
			log.debug('no accessToken || movesId')
			return callback('err');
		}
		console.log('updateUser: ', movesId + '\n');
		request('https://api.moves-app.com/api/1.1/user/activities/daily?pastDays=1&access_token='+accessToken, function(err, response, body) {
			if (err) callback(err);
			if (!body || !response) {
				return callback('error: no body or response\n');
				log.error('error: no body or response\n');
			}

			var payload = JSON.parse(body);
			if (payload) { // parsed data from request
				MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
					if (err) {
						return callback(err);
					}
					// each of the days retrieved from moves api, check to see if it's in the db, if so, make sure the # of steps match, update if not.
					payload.forEach(function(moves_data) {
						if (!db) {
							log.error('inside payload.forEach: no db connection\n');
							callback(err +' \n no db -- updateUser: payload.forEach')
						}
						if (!moves_data || !moves_data.summary) {
							log.info('no moves data summary');
							return callback(null, undefined);
						}
						moves_data.summary.forEach(function(activity) {
							var activityDate = moment(moves_data.date, "YYYYMMDD").format("YYYY-MM-DD")
							if (activityDate !== today) {
								log.error('server is a date ahead? dates do not match.')
								return callback(null, 'server is a date ahead? dates do not match.')
							}
							if (!db) {
								log.error('inside moves_data.summary.forEach: no db connection\n');
								return callback(err +' \n no db -- updateUser: payload.forEach')
							}
							if (activity.steps) {
								// format date from 20140201 -> 2014-02-01
								var steps = activity.steps;

								// checks to see if there's already a document in the db with the date from moves,
								// updates db with # of steps from moves
								var query = { user : movesId, date : activityDate };
								db.collection('steps').findOne(query, function(err, doc) {
									if (err) return callback(err);
									if (!doc) {
										log.info('Inserting into db: ', movesId, activityDate, steps, today)
										console.log('No data for ' + today + ' found, inserting: ');
										// no data found for this date in our db, save it
										db.collection('steps').insert({
											"user"  : movesId,
											"date"  : activityDate,
											"steps" : steps,
											"last_updated" : today,
										}, function(err, success){
											if (err) { callback( err ) }
											log.info('Data entered into db: ' + movesId, activityDate, steps);
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
														log.info('Steps Collection: ' + doc.user, doc.steps, + steps + ': ' + doc.date + '\n');
													}
												})
											}
										})
									}
								})
							}
						})
					})
					return callback(null, 'updateUser complete');
				})
			}
			if (!payload) {
				return callback(null, true);
			}
		})
	},
	// returns users steps for today
	getSteps : function( movesId, callback ) {
		database.connect(function( err, db ) {
			if ( err ) callback( err );
			var query = { user : movesId, date : today };
			db.collection('steps').findOne(query, function(err, data) {
				if (err) {
					callback(err);
				}
				else if (data) {
					log.info('user.getSteps:', data);
					callback( null, data );
				}
			})
		})
	},

	// checks users collection and returns true or false if the username is set.
	// we'll consider having a username being registered
	isRegistered : function( movesId, callback ) {
		if (!movesId) {
			callback("error: no movesId to check if user is registered");
		}
		database.connect(function( err, db ) {
			if ( err ) {
				log.error(err);
				console.log('error: unable to connect to database');
				callback( err );
			}
			var users = db.collection('users')
			,   query = { user: movesId };
			users.findOne(query, function(err, doc) {
				if (err || !doc) {
					log.error(err);
					callback(err)
				}
				if (doc.username) {
					return callback( null, doc );
				}
				else {
					return callback( null, false );
				}
			})
		})
	},
}
