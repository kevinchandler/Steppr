var request = require('request')
,   moment = require('moment')
,   now = moment()
,   today = now.format("YYYY-MM-DD")
,   MongoClient = require('mongodb').MongoClient
,   dotenv = require('dotenv');
dotenv.load();


module.exports = {
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
