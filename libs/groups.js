var request = require('request')
,   moment = require('moment')
,   now = moment()
,   today = now.format("YYYY-MM-DD")
,   dotenv = require('dotenv')
,   database = require('./database.js')
,   fs = require('fs')
,   Log = require('log')
,   log = new Log('debug', fs.createWriteStream('logs/libs-groups-log.txt', {"flags": "a"}));

dotenv.load();


module.exports = {

	// need group name and creator
	// check if group exists
	// create

	createGroup : function(groupName, groupCreator, callback) {
		if (!groupName || !groupCreator) {
			console.log('no name or creator, cannot create group');
			callback('no name or creator, cannot create group');
		}
		database.connect(function(err, db) {
			if (err || !db) callback(err);

			db.collection('groups').findOne({ name: groupName }, function(err, group) {
				if (!group) {
					db.collection('groups').insert({
						name: groupName,
						creator : groupCreator,
						members : [groupCreator],
						stepsToday : 0,
						stepsTotal : 0,
					}, function(err, success) {
						if (err) {
							callback(err);
						}
						if (success) {
							callback(null, success);
						}
					})
				}
				else if (group) {
					callback('Unable to create group: already exists')
				}
			})
		})
	},
	// list groups in groups collection.
	displayGroups : function(callback) {
		database.connect(function(err, db) {
			if (err) callback( err );
			var package = [];
			// push each group object into the package array and send once there's no more groups
			db.collection('groups').find().each(function(err, group) {
				if (err) { return callback(err) };
				if (!group) {
					console.log('sending package');
					console.log(package);
					callback(null, package)
				}
				else {
					package.push({
						name: group.name
					})
				}
			})
		})
	}
}
