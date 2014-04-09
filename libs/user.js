var request = require('request')
,	 connection = require('./mongo_connection.js')
,   moment = require('moment')
// ,   now = moment()
// ,   today = now.format("YYYY-MM-DD")
,   dotenv = require('dotenv')
,   user = require('./user.js')
,   fs = require('fs')
,   Log = require('log')
,   log = new Log('debug', fs.createWriteStream('logs/libs-user-log.txt', {"flags": "a"}));

dotenv.load();

module.exports = {

	// this is called after user authenticates with moves if user is not already in db
	createNewUser : function(accessToken, refreshToken, movesId, callback) {
		var now = moment()
		,   today = now.format("YYYY-MM-DD");
		connection(function(db) {
			if (!db) return callback(new Error + ' unable to connect to db');
			var  placeholder = '';
			db.collection('users').insert({
				user: movesId,
				username: '',
				email: '',
				birthday: today,
				stepsToday : 0,
				stepsTotal : 0,
				points: {
					total: 0
				},
				badges: ['Beta Tester'],
				groups: [],
				access_token : accessToken,
				refresh_token : refreshToken,
			}, function(err, success) {
				if (err) {
					log(err);
					console.log(err, 'unable to create new user');
					return callback(err);
				}
				if (success) {
					log.info('createNewUser: ', success);
					callback(null, success);
				}
			})
		})
	},

	// sets/changes username to a user that's already been created
	registerUser : function(userId, username, callback) {
		connection(function(db) {
			if (!db) return callback(new Error + ' unable to connect to db');
			db.collection('users').update({ user : userId }, { $set: { "username" : username }}, function(err, success) {
				if (err) { log.error(err); return res.redirect('back'); }
				if (success) {
					log.info( success, 'username set: ' + username, user );
					console.log('username successfully set: ', userId,  username );
					callback(null, success);
				}
				else {
					callback('registerUser: could not register user');
				}
			})
		})
	},

	viewUser : function(username, callback) {
		connection(function(db) {
			if (!db) return callback(new Error + ' unable to connect to db');
			db.collection('users').findOne({username: username}, function(err, data) {
				if (err) return callback(err);
				if (data !== null) {
					var package = {};
					package.username = data.username;
					package.stepsTotal = data.stepsTotal;
					package.stepsToday = data.stepsToday;
					package.groups = data.groups;
					package.badges = data.badges;
					package.points = data.points;
					callback(null, package);
				}
				else {
					callback(null, null);
				}
			})
		})
	},

	// returns user document. Uses userId rather than username, as viewUser uses username.
	// this is for the user to get data about themself
	getUser : function(userId, callback) {
		connection(function(db) {
			if (!db) return callback(new Error + ' unable to connect to db');
			db.collection('users').findOne({user: userId}, function(err, doc) {
				if (err || !doc) {
					console.log('error or no doc');
					return callback(err || 'no doc')
				}
				else {
					console.log(doc);
					return callback(null, doc);
				}
			})
		})
	},

	// remove this later.
	findUser : function(userId, callback) {
		connection(function(db) {
			if (!db) return callback(new Error + ' unable to connect to db');
			db.collection('users').findOne({user: userId}, function(err, doc) {
				if (err) return callback(err);
				if (doc) {
					log.info('findUser complete: ', doc);
					callback(null, doc);
				}
				else if (!doc) {
					log.error('findUser complete: no doc found')
					callback(null);
				}
			})
		})
	},


  //	 gets each day of moves activity for pastDays in the request query
  //	checks to see if each date is in the database and makes sure the steps in db matches what moves gives us
	updateUser : function (accessToken, movesId, callback) {
		var now = moment()
		,   today = now.format("YYYY-MM-DD")
		,	 pastDays = 1;

		if (!accessToken || !movesId) {
			log.debug('no accessToken || movesId')
			return callback('updateUser : missing accessToken or movesId');
		}
		request('https://api.moves-app.com/api/1.1/user/activities/daily?pastDays='+pastDays+'&access_token='+accessToken, function(err, response, body) {
			console.log('updateUser: ', movesId);
			if (err) callback(err);
			if (!body || !response) {
				log.error('error: no body or response');
				return callback('error: no body or response');
			}

			var payload = JSON.parse(body.toString());

			if (payload) { // parsed data from request
				connection(function(db) {
					if (!db) return callback(new Error + ' unable to connect to db');
					// each of the days retrieved from moves, check to see if it's in the db, if so, make sure the # of steps match, update if not.
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
										// doc found for this date, update it
										db.collection('steps').update({_id: doc._id}, {$set: { 'steps' : steps}}, function(err, success) {
											if (err) return callback(err);
											if (success) {
												if (doc.steps !== steps) {
													console.log('Steps Collection: ' + doc.user, doc.steps, ' updated -> ' + steps + ': ' + doc.date + '\n');
													log.info('Steps Collection: ' + doc.user, doc.steps, ' updated -> ' + steps + ': ' + doc.date + '\n');
												}
												if (activityDate === today) {
													db.collection('users').update({user: doc.user}, {$set: { "stepsToday" : steps}}, function(err, success) {
														if (err) return callback(err);
													})
												}
												else {
													console.log('1');
													callback(null, true);
												}
											}
											else {
												console.log('2');
												callback(null, true)
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
			else {
		    callback(null, true);
			}
			callback(null);
		})
	},

	// returns users steps for today
	userStepsToday : function(movesId, callback ) {
		var now = moment()
		,   today = now.format("YYYY-MM-DD");
		if (!movesId) { return callback('getUserSteps - no movesId ')}
		connection(function(db) {
			if (!db) return callback(new Error + ' unable to connect to db');
			var query = { user : movesId, date : today };
			db.collection('steps').findOne(query, function(err, data) {
				if (err) {
					return callback(err);
				}
				else if (data) {
					log.info('user.getSteps:', data);
					return callback( null, data.steps );
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
		connection(function(db) {
			if (!db) return callback(new Error + ' unable to connect to db');
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

	joinGroup : function( userId, groupName, callback) {
		var now = moment()
		,   today = now.format("YYYY-MM-DD");

		console.log('inside joinGroup callback:', userId, groupName);
		log.info('inside joinGroup callback: ', userId, groupName);
		connection(function(db) {
			if (!db) return callback(new Error + ' unable to connect to db');
			db.collection('users').findOne({user: userId}, function(err, doc) {
				if (err || !doc) {
					return callback(err || 'user.joinGroup: no doc\n', null)
				}
				if (doc.groups.length !== 0) {
					return callback('User in group \n')
				}
				else {
					var newMember = {
						id : userId,
						username : doc.username,
						joined : today,
					};
					// add user to group
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
		connection(function(db) {
			if (!db) return callback(new Error + ' unable to connect to db');
			db.collection('users').findOne({user: userId}, function(err, doc) {
				if (err || !doc) {
					return callback(err || 'user.leaveGroup: no doc\n', null)
				}
				else {
					var index = doc.groups.indexOf(groupName);
					if (index > -1) {
						doc.groups.splice(index, 1);
						db.collection('users').update({user : userId}, { $pull: { groups: groupName }}, function(err, success) {
							if (err || !success) {
								return callback(err || 'leaveGroup - removing group from user failed\n');
							}
							if (success) {
								log.info(success);
								db.collection('groups').update({ name: groupName }, { $pull: {
									members: { id: userId }
								}},
								function(err, success) {
									if (err || !success) {
										return callback('leaveGroup: failed' + err || 'not successful');
									}
									else {
										return callback(null, success);
									}
								})
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

	createGroup : function(groupCreator, groupName, callback) {
		var now = moment()
		,   today = now.format("YYYY-MM-DD");
		if (!groupName || !groupCreator) {
			console.log('no name or creator, cannot create group');
			callback('no name or creator, cannot create group');
		}
		connection(function(db) {
			if (!db) return callback(new Error + ' unable to connect to db');
			db.collection('groups').findOne({ name: groupName }, function(err, group) {
				if (!group) {
					db.collection('groups').insert({
						name: groupName,
						creator : groupCreator,
						created : today,
						members : [],
						stepsToday : 0,
						stepsTotal : 0,
					}, function(err, success) {
						if (err) {
							return callback(err);
						}
						if (success) {
							// automatically join group --broken
							// user.joinGroup(groupCreator, groupName, function(err, success) {
							// 	if (err) return callback(err);
							// 	if (success) {
									return callback(null, success);
								// }
							// })
						}
					})
				}
				else if (group) {
					callback('Unable to create group: already exists');
				}
			})
		})
	},
}
