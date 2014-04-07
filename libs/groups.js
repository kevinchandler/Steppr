var request = require('request')
,	 connection = require('./mongo_connection.js')
,   moment = require('moment')
// ,   now = moment()
// ,   today = now.format("YYYY-MM-DD")
,	 user = require('./user')
,   dotenv = require('dotenv')
,   fs = require('fs')
,   Log = require('log')
,   log = new Log('debug', fs.createWriteStream('logs/libs-groups-log.txt', {"flags": "a"}));

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
					})
				}
			})
		})
	},

	// returns: group, totalGroupSteps, totalGroupStepsToday, members[username: , id: ]
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
					return callback('no group');
				}
				if (!group.members) {
					return callback('no group members');
				}
				else {
					var groupMembers = [];
					group.members.forEach(function(member) {
						package.members.push(member);
					})
					callback(null, package)
				}
			})
		})
	},
}

//       BROKEN
// 	updateGroup : function( groupName, callback ) {
// 		connection(function(db) {
// 			if (!db) return callback(new Error + ' unable to connect to db');
// 			var members = [];
// 			var stepsToday = 0;
// 		  db.collection('groups').findOne({ name : groupName }, function(err, group) {
// 				if (err || !group) return callback(err || 'updateGroup: no group found');
// 				members.push(group.members.)
// 					group.members.forEach(function(member) {
// 						user.userStepsToday(member.id, function(err, data) {
// 							if (err) return callback(err);
// 							stepsToday += data;
// 						})
// 					})
// 				// console.log(stepsToday);
// 				// callback(null, stepsToday)
// 			})
// 		})
// 	},
// }
