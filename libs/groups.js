var request = require('request')
,   moment = require('moment')
,   now = moment()
,   today = now.format("YYYY-MM-DD")
,   MongoClient = require('mongodb').MongoClient
,   dotenv = require('dotenv');
dotenv.load();


module.exports = {

	// need group name and creator
	// check if group exists
	// create

	createGroup : function(groupName, groupCreator, callback) {
		if (!name || !creator) {
			callback('no name or creator, cannot create group')
		}
		database.connect(function(err, db) {
			if (err || !db) callback(err);

			var groups = db.collection('groups');
			groups.findOne({name: name}, function(err, group) {
				if (!group) {
					groups.insert({
						name: groupName,
						creator : groupCreator,
						members : [groupCreator],
						stepsToday : 0,
						stepsTotal : 0,
					})
				}
				else {
					// need to do something here.
					return;
				}
			})
		})
	},
	// list groups in groups collection. 
	displayGroups : function(callback) {
		MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
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
