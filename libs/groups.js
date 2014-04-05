var request = require('request')
,	 connection = require('./mongo_connection.js')
,   moment = require('moment')
,   now = moment()
,   today = now.format("YYYY-MM-DD")
,   dotenv = require('dotenv')
,   fs = require('fs')
,   Log = require('log')
,   log = new Log('debug', fs.createWriteStream('logs/libs-groups-log.txt', {"flags": "a"}));

dotenv.load();


module.exports = {

	createGroup : function(groupName, groupCreator, callback) {
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
						members : [],
						stepsToday : 0,
						stepsTotal : 0,
					}, function(err, success) {
						if (err) {
							callback(err);
						}
						if (success) {
							// need to add group to user doc in users collection
							callback(null, success);
						}
					})
				}
				else if (group) {
					callback('Unable to create group: already exists');
				}
			})
		})
	},

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
					})
				}
			})
		})
	},

	// returns: group, totalGroupSteps, totalGroupStepsToday, members[]
	viewGroup : function(group, callback) {
		connection(function(db) {
			if (!db) return callback(new Error + ' unable to connect to db');
			var package = {
				group : group,
				totalGroupSteps : 0,
				totalGroupStepsToday : 0,
				members : []
			};
			db.collection('groups').findOne({name: group}, function(err, group) {
				if (err) return callback(err);
				if (!group) {
					callback('no group');
				}
				else {
					db.collection('users').find({ groups : group }).each(function(err, groupMember){
						if (err) callback (err);
						if (!groupMember) {
							callback(null, package)
						}
						if (groupMember) {
							package.members.push(groupMember);
							package.totalGroupStepsToday += groupMember.stepsToday;
						}
					})
				}
			})
		})
	},
}
