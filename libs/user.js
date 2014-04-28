var request = require('request')
,	 connection = require('./mongo_connection.js')
,   moment = require('moment')
,   dotenv = require('dotenv')
,   user = require('./user.js')
,   fs = require('fs')
,   Log = require('log')
,   log = new Log('debug', fs.createWriteStream('logs/log.txt', {"flags": "a"}));

dotenv.load();


function delimitNumbers(str, callback) {
	return (str + "").replace(/\b(\d+)((\.\d+)*)\b/g, function(a, b, c) {
			return (b.charAt(0) > 0 && !(c || ".").lastIndexOf(".") ? b.replace(/(\d)(?=(\d{3})+$)/g, "$1,") : b) + c;
	});
}

module.exports = {

	// this is called after user authenticates with moves if user is not already in db
	createNewUser : function(accessToken, refreshToken, userId, callback) {
		if (accessToken && refreshToken && userId) {
			var now = moment()
			,   today = now.format("YYYY-MM-DD");
			connection(function(db) {
				if (!db) return callback(new Error + ' unable to connect to db');
				var  placeholder = '';
				db.collection('users').insert({
					user: userId,
					username : '',
					info : {
						email: '',
						joined: today,
						location : {
							city : '',
							state : '',
							zipcode : '',
						},
					},
					points: {
						total: 0
					},
					steps : {
						today : 0,
						total : 0,
						daily : []
					},
					badges: ['Beta Tester'],
					groups: [],
					challenging : [],
					access_token : accessToken,
					refresh_token : refreshToken,
				}, function(err, success) {
					if (err) {
						log(err);
						return callback(err);
					}
					if (success) {
						log.info('createNewUser: ', success);
						callback(null, success);
					}
				})
			})
		}
	},

	// sets/changes username to a user that's already been created
	registerUser : function(userId, username, state, callback) {
		// removed email for now.
		if ( userId && username && state ) {
			connection(function(db) {
				if (!db) return callback(new Error + ' unable to connect to db');
				db.collection('users').update({ user : userId }, { $set: { "username" : username, "info.location.state" : state }}, function(err, success) {
					if (err) { log.error(err); return res.redirect('back'); }
					if (success) {
						log.info('registerUser: ' + username, user, state);
						console.log('registerUser: ' + username, user, state);
						return callback(null, success);
					}
					else {
						return callback('registerUser: could not register user');
					}
				})
			})
		}
	},

	viewUser : function(username, callback) {
		if (username) {
			connection(function(db) {
				if (!db) return callback(new Error + ' unable to connect to db');
				db.collection('users').findOne({ username: username }, function(err, data) {
					if (err) return callback(err);
					if (data !== null) {
						var package = {
							steps : { },
						};
						package.username = data.username;
						package.user = data.user;
						package.steps.total = delimitNumbers(data.steps.total);
						package.steps.today = delimitNumbers(data.steps.today);
						package.groups = data.groups;
						package.badges = data.badges;
						package.points = delimitNumbers(data.points);
						// package.challenging = data.challenging;
						callback(null, package);
						// db.collection('steps').find({ user : username })
					}
					else {
						callback(null, null);
					}
				})
			})
		}
	},

	// returns user document. Uses userId rather than username, as viewUser uses username.
	// this is for the user to get data about themself
	getSelf : function(userId, callback) {
		if (userId) {
			connection(function(db) {
				if (!db) return callback(new Error + ' unable to connect to db');
				db.collection('users').findOne({ user: userId }, function(err, data) {
					console.log(data);
					if (err || !data) {
						console.log('error or no data');
						return callback(err || 'no data')
					}
					else {
						var package = {
							steps : { },
						};
						package.username = data.username;
						package.user = data.user;
						package.steps.total = delimitNumbers(data.steps.total);
						package.steps.today = delimitNumbers(data.steps.today);
						package.groups = data.groups;
						package.badges = data.badges;
						package.points = delimitNumbers(data.points);
						return callback(null, package);
					}
				})
			})
		}
	},

	// remove this later.
	findUser : function(userId, callback) {
		if (userId) {
			connection(function(db) {
				if (!db) return callback(new Error + ' unable to connect to db');
				db.collection('users').findOne({user: userId}, function(err, doc) {
					if (err) return callback(err);
					if (doc) {
						log.info('findUser complete: ', doc);
						callback(null, doc);
					}
					else if (!doc) {
						log.error('findUser complete: no doc found');
						callback(null);
					}
				})
			})
		}
	},


 // to do :
	//	when 0 steps today, request(movesApi) for yesterdays steps, to grab accurate data
	// check to see who had most steps, and which group, and award them a badge.
	updateUser : function (accessToken, movesId, callback) {
		var  now = moment()
		,    today = now.format("YYYY-MM-DD")
		,		yesterday = moment().subtract('days', 1).format('YYYY-MM-DD')
		,	  pastDays = 1;

		if (accessToken && movesId) {
			request('https://api.moves-app.com/api/1.1/user/activities/daily?pastDays='+pastDays+'&access_token='+accessToken, function(err, response, body) {
				if (err) return callback(err);
				if (!body || !response) {
					log.error('error: no body or response');
					return callback('error: no body or response');
				}

				// data retrieved from moves api
				var payload = JSON.parse(body.toString());

				if (payload) {
					connection(function(db) {
						if (!db) return callback(new Error + ' unable to connect to db');
						var users = db.collection('users');
						// each of the days retrieved from moves, check to see if it's in the db, if so, make sure the # of steps match, update if not.
						payload.forEach(function(moves_data) {
							if (!moves_data || !moves_data.summary) {
								// no steps for this date, change steps.today to 0 and push current stepsToday into steps.daily array
								users.findOne({ user : movesId }, function(err, user) {
									if (err) return callback(err);
									if ( user.steps.today !== 0 ) {
										// check to see if steps.today isnt already 0 before adding yesterdays data to daily steps
										var package = {
											date : yesterday,
											steps : 0,
										}
										users.update({ 'user' : movesId}, { $push : { 'steps.daily' : package }}, function(err, success) {
											if (err) return callback(err);
											if (success) { // steps.daily updated with yesterday's steps. Now set steps.today to 0
												users.update({ 'user' : movesId }, { $set : {  'steps.today' : 0 }}, function(err, success) {
													if (err) log.error(err);
													log.info('updateUser: New day : ' + movesId, yesterday, steps);
													return callback(null, success);
												})
											}
										})
									}
									else {
										return callback('User has no steps for today, nothing to update')
									}
								})
							}
							if (moves_data && moves_data.summary) {
								// update users steps for each day retrieved from moves
								moves_data.summary.forEach(function(activity) {
									var activityDate = moment(moves_data.date, "YYYYMMDD").format("YYYY-MM-DD");
									if (activity.steps) {
										// format date from 20140201 -> 2014-02-01
										var steps = activity.steps // number of steps user has today
										,	 query = { user : movesId };

										users.findOne(query, function(err, user) {
											if ( err ) {
												return callback( err );
												log.error( err );
											}
											if ( !user ) {
												return callback( 'No user retrieved from database' );
											}
											users.update({ user : movesId }, { $set : { 'steps.today' : steps }}, function(err, success) {
												if (err) return callback(err);
												if (success) {
													console.log('successfully updated user daily steps ' + movesId);
													users.findOne({ user: movesId }, function(err, user) {
														if (err) return callback(err);
														var userStepsTotal = 0;
														user.steps.daily.forEach(function(el) {
															userStepsTotal += el.steps
														})
														users.update({ user : movesId }, { $set : { 'steps.total' : userStepsTotal }}, function(err, success) {
															if (err) return callback(err);
															console.log('successfully updated user total steps ' + movesId);
															return callback(success);
														})
													})
												}
											})
										})
									}
								})
							}
						})
						callback(null, 'updateUser complete');
					})
				}
				else {
					callback(null, true);
				}
				callback(null);
			})
		}
	},

	// returns users steps for today
	userStepsToday : function(movesId, today, callback ) {
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
		var  now = moment()
		,   today = now.format("YYYY-MM-DD");

		log.info('inside joinGroup callback: ', userId, groupName);
		connection(function(db) {
			if (!db) return callback(new Error + ' unable to connect to db');
			db.collection('users').findOne({user: userId}, function(err, doc) {
				if (err || !doc) {
					return callback(err || 'user.joinGroup: no doc\n', null)
				}
				if (doc.groups.length !== 0) {
					return callback('User in group \n');
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
								if (err) callback(err);
								if (success) {
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

	createGroup : function(groupCreator, groupName, today, callback) {
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
						steps : {
							today : 0,
							total : 0,
							daily : [],
						},
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

	// challengeUser : function(challengerId, challengeeUsername, date, callback) {



	/////////
	// angular scope has userId, no need to find it from db.
	////////


		// make sure we have the necessary data
		// if ( !challengerId || !challengeeUsername || !date ) {
		// 	log.info('challengeUser: missing required date to challenge the user');
		// 	return callback('challengeUser: missing required date to challenge the user');
		// }
		// connection(function(db) {
		// 	if (!db) return callback(new Error + ' unable to connect to db');
		// 	var challengeeId
		// 	,	 challengerUsername;

	// 		 {
  //    findAndModify: "people",
  //    query: { name: "Tom", state: "active", rating: { $gt: 10 } },
  //    sort: { rating: 1 },
  //    update: { $inc: { score: 1 } }
  //  }



			// find challengees userId and set challenging : { }
			// making sure we have both users' id & username
		// 	db.collection('challenges').findOne({ username : challengeeUsername, date : date  }, function(err, challenge) {
		// 		if (err) return callback(err);
		// 		if ( challenge ) {
		// 			log.info('user is already challenging someone');
		// 			return callback('user is already challenging someone');
		// 		}
		// 			// challengee is not challenging anyone, continue
		// 			challengeeId = user.user;
		// 			db.collection('users').findOne({ user : challengerId }, function(err, user) {
		// 				if (err) return callback(err);
		// 				if (user.challenging.date === date) {
		// 					log.info('user is already challenging someone');
		// 					return callback('user is already challenging someone');
		// 				challengerUsername = user.username;
		//
		// 				// update both users' challenging : { } to eachother
		// 				db.collection('users').update({ user : challengeeId }, { $push : { challenges : { id : challengerId, username : challengerUsername, date : date, winning : false }}}, function(err, success) {
		// 					if (err) return callback(err);
		// 					db.collection('users').update({ user : challengerId }, { $push : { challenges : { id : challengeeId, username : challengeeUsername, date : date, winning : false }}}, function(err, success) {
		// 						if (err) return callback(err);
		// 						return callback(null, success);
		// 					})
		// 				})
		// 			})
		// 		}
		// 	})
		// })
	// },
}
