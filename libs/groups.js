var request = require('request')
,	 connection = require('./mongo_connection.js')
,   moment = require('moment')
,	 user = require('./user')
,   dotenv = require('dotenv')
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

	// returns: _id, name, stepsTotal
	viewAllGroups : function(callback) {
		connection(function(db) {
			if (!db) return callback(new Error + ' unable to connect to db');
			var package = [{
				steps : {},
			}];
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
						steps : {
							today : delimitNumbers(group.steps.today),
							total : delimitNumbers(group.steps.total)
						}
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
				name : group,
				steps : {
					today : 0,
					total : 0,
				},
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
					package.steps.total = delimitNumbers(group.steps.total);
					package.steps.today = delimitNumbers(group.steps.today);
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
				steps : {
					today : 0,
					total : 0,
				}
			};
			db.collection('users').find({ groups: groupName }).each(function(err, user) {
				if (err) return callback('updateGroup: failed to find each user');
				if (user)  {
					package.steps.today += user.steps.today;
					package.steps.total += user.steps.total;
				}
				if (!user)  {
					// mongo reached the end; check if groups steps today = package.steps & update if not then send package
					db.collection('groups').findOne({ name : groupName }, function(err, group) {
						if (err) return callback('updateGroup: failed to find group');
						if (package.steps.today !== group.steps.today) {
							db.collection('groups').update({ name : groupName }, { $set : { steps : { 'today' : package.steps.today, 'total' : package.steps.total}}}, function(err, success) {
								if (err || !success) return callback(err || 'updateGroup: failed to update groups steps.today');
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
