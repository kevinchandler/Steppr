var request = require('request')
,   moment = require('moment')
,   now = moment()
,   today = now.format("YYYY-MM-DD")
,   MongoClient = require('mongodb').MongoClient
,   dotenv = require('dotenv')
,   user = require('./user.js')
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
		request('https://api.moves-app.com/api/1.1/user/activities/daily?pastDays=1&access_token='+accessToken, function(err, response, body) {
			console.log('updateUser: ', movesId + '\n');
			if (err) callback(err);
			if (!body || !response) {
				callback('error: no body or response\n');
				log.error('error: no body or response\n');
			}

			// parse expects a string as 1st arg. This prevents unnecessary errors thrown if the body ends up being something other than a string

			var payload = JSON.parse(body.toString());

			if (payload) { // parsed data from request
				MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
					if (err || !db) {
						return callback(err || 'user.updateUser: no db');
					}
					// each of the days retrieved from moves api, check to see if it's in the db, if so, make sure the # of steps match, update if not.
					payload.forEach(function(moves_data) {
						if (db === null) {
							log.error('inside payload.forEach: no db connection\n');
							return callback(err +' \n no db -- updateUser: payload.forEach')
						}
						if (!moves_data || !moves_data.summary) {
							log.info('no moves data summary');
							return callback('no moves data');
						}
						moves_data.summary.forEach(function(activity) {
							if (db === null) {
								log.error('inside moves_data.summary.forEach: no db connection\n');
								return callback(err +' \n no db -- updateUser: payload.forEach')
							}
							var activityDate = moment(moves_data.date, "YYYYMMDD").format("YYYY-MM-DD");
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
									else {
										db.collection('steps').update({_id: doc._id}, {$set: { 'steps' : steps}}, function(err, success) {
											if (err) callback(err);
											if (success) {
												if (doc.steps !== steps) {
													console.log('Steps Collection: ' + doc.user, doc.steps, ' updated -> ' + steps + ': ' + doc.date + '\n');
													log.info('Steps Collection: ' + doc.user, doc.steps, ' updated -> ' + steps + ': ' + doc.date + '\n');

												}
												if (activityDate === today) {
													db.collection('users').update({user: doc.user}, {$set: { "stepsToday" : steps}}, function(err, success) {
														if (err) callback(err);
													})
												}
											}
										})
									}
								})
							}
						})
					})
					callback(null, 'updateUser complete');
				})
			}
			if (!payload) {
			    callback(null, true);
			}
			callback(null);
		})
	},
	// returns users steps for today
	getSteps : function( movesId, callback ) {
		database.connect(function( err, db ) {
			if ( err  || !db ) return callback( err || 'user.getSteps: no db connection' );
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
					callback(err);
				}
				if (doc.username) {
					callback( null, doc );
				}
				else {
					console.log('user is not registered');
					callback( null, false );
				}
			})
		})
	},


	// // returns groups that user is in or false for none
	// isInGroup : function(userId, callback) {
	// 	if (!userId) {
	// 		log.error('user.isInGroup: No userId');
	// 		return callback('user.isInGroup: No userId');
	// 	}
	// 	database.connect(function(err, db) {
	// 		db.collection('users').findOne({user: userId}, function(err, user) {
	// 			if (err || !user) return callback(err);
	// 			var package = [];
	// 			user.groups.forEach(function(group) {
	// 				package.push(group)
	// 			})
	// 			if (package.length === 0) {
	// 				callback(null, false)
	// 			}
	// 			else {
	// 				callback(null, package);
	// 			}
	// 		})
	// 	})
	// },


	// returns user document from users collection
	getUser : function(userId, callback) {
		database.connect(function(err, db) {
			if (err || !db) callback(err);
			db.collection('users').findOne({user: userId}, function(err, doc) {
				if (err || !doc) {
					return callback(null, false)
				}
				else {
					return callback(null, doc);
				}
			})
		})
	},

	joinGroup : function( userId, groupName, callback) {
		console.log('inside joinGroup callback:', userId, groupName);
		log.info('inside joinGroup callback: ', userId, groupName);
		database.connect(function(err, db) {
			if (err || !db) callback(err);
			db.collection('users').findOne({user: userId}, function(err, doc) {
				if (err || !doc) {
					return callback(err || 'user.joinGroup: no doc\n', null)
				}
				if (doc.groups.length !== 0) {
					return callback('User in group\n', false)
				}
				else {
					var newMember = {
						id : userId,
						username : doc.username,
					};
					// put user in group
					db.collection('groups').update({ name: groupName }, { $push: { members: newMember }}, function(err, success) {
						if (err || !success) callback(err);
						if (success) {
							// add group to user
							db.collection('users').update({ user : userId }, { $push: { groups: groupName }}, function(err, success) {
								if (err || !success) callback(err);
								if (success) {
									console.log(success);
									return callback(null, success);
								}
								else {
									return callback(null, false);
								}
							})
						}
					})
				}
			})
		})
	},

	leaveGroup : function(userId, groupName, callback) {
		console.log('inside leaveGroup callback:', userId, groupName);
		log.info('inside leaveGroup callback: ', userId, groupName);
		database.connect(function(err, db) {
			if (err || !db) callback(err);
			db.collection('users').findOne({user: userId}, function(err, doc) {
				if (err || !doc) {
					return callback(err || 'user.leaveGroup: no doc\n', null)
				}
				else {
					var index = doc.groups.indexOf(groupName);
					if (index > -1) {
						// doc.groups.splice(index, 1);
						db.collection('users').update({user : userId}, { $pull: { groups: groupName }}, function(err, success) {
							if (err || !success) {
								return callback(err || 'leaveGroup - failed\n');
							}
							if (success) {
								log.info(success);
								return callback(null, userId + ' successfully left group ' + groupName);
							}
							else {
								return callback(userId + ' unable to leave group ' + groupName);
							}
						})
					}
					else {
						log.error('leaveGroup callback: It looks like the user is not a member of that group')
						return callback('leaveGroup callback: It looks like the user is not a member of that group\n');
					}
				}
			})
		})
	},
}
