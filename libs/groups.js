var request = require('request')
,	 connection = require('./mongo_connection.js')
,   moment = require('moment')
,	 user = require('./user')
,   dotenv = require('dotenv')
,   fs = require('fs')
,   Log = require('log')
,   log = new Log('debug', fs.createWriteStream('logs/log.txt', {"flags": "a"}));

dotenv.load();


module.exports = {

	// returns: _id, name, stepsTotal
	viewAllGroups : function(callback) {
		connection(function(db) {
			if (!db) return callback(new Error + ' unable to connect to db');
			var package = [];
			// push each group object into the package array and send once there's no more groups
			db.collection('groups').find().each(function(err, group) {
				if (err) { return callback(err) };
				// no more groups, send package.
				if (!group) {
					callback(null, package)
				}
				else {
					package.push({
						_id: group._id,
						name: group.name,
						stepsTotal : group.stepsTotal,
						stepsToday : group.stepsToday
					})
				}
			})
		})
	},

	// returns: group, totalGroupSteps, totalGroupStepsToday, members[username: , id: ]
	showGroup : function(group, callback) {
		connection(function(db) {
			if (!db) return callback(new Error + ' unable to connect to db');
			var package = {
				name : group,
				stepsTotal : 0,
				stepsToday : 0,
				members : []
			};
			db.collection('groups').findOne({ name: group }, function(err, group) {
				if (err) return callback(err);
				if (!group) {
					return callback('no group');
				}
				if (!group.members) {
					return callback('no group members');
				}
				else {
					package.stepsTotal += group.stepsToday;
					package.stepsToday += group.stepsToday;
					var groupMembers = [];
					group.members.forEach(function(member) {
						package.members.push(member);
					})
					callback(null, package)
				}
			})
		})
	},

	updateGroup : function(groupName, callback) {
		var now = moment()
		,   today = now.format("YYYY-MM-DD");

		connection(function(db) {
			if (!db) return callback(new Error + ' unable to connect to db');
			var package = {
				steps : 0
			};
			db.collection('users').find({ groups: groupName }).each(function(err, user) {
				if (err) return callback('updateGroup: failed to find each user');
				if (user)  {
					package.steps += user.stepsToday;
				}
				if (!user)  {
					// mongo reached the end; check if groups steps today = package.steps & update if not then send package
					db.collection('groups').findOne({ name : groupName }, function(err, group) {
						if (err) return callback('updateGroup: failed to find group');
						if (package.steps !== group.stepsToday) {
							db.collection('groups').update({ name : groupName }, { $set : { 'stepsToday' : package.steps }}, function(err, success) {
								if (err || !success) return callback(err || 'updateGroup: failed to update groups stepsToday');
								callback(null, success);
							})
						}
						else {
							callback(null, true);
						}
					})
				}
			})
		})
	}
}
