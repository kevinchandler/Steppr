var groups = require('../libs/groups.js')
,   user = require('../libs/user.js')
,   fs = require('fs')
,   Log = require('log')
,   log = new Log('debug', fs.createWriteStream('logs/libs-groups-log.txt', {"flags": "a"}));


exports.index = function(req, res) {
	groups.viewAllGroups(function(err, groups) {
		console.log('inside of displayGroups callback');
		if (err) { console.log(err) }
		res.render('groups.jade', { groups: groups });
	})
}


// individual group page
exports.viewGroup = function(req, res) {
	var groupName = req.params.groupName;
	groups.viewGroup(groupName, function(err, group) {
		res.render('viewGroup.jade', { group : group[0] });
	})

}

exports.createGroup = function(req, res) {
	console.log('inside create group');
	if ( req.method == 'GET' ) {
		user.isRegistered(req.session._movesId, function(err, isRegistered) {
			console.log(isRegistered);
			if (err) {
				console.log(err);
				log.error(err);
				res.redirect('back');
			}
			if (!isRegistered) {
				res.redirect('/user/register');
			}
		    if (isRegistered) {
				res.render('creategroup.jade');
			}
		})
	}
	if ( req.method === 'POST' ) {
		var groupName = req.body.groupName;
		groups.createGroup(groupName, req.session._movesId, function(err, success) {
			console.log('inside createGroup callback');
			if (err) console.log(err);
			if (success) {
				user.joinGroup(req.session._movesId, groupName, function(err, success) {
					if (err) return console.log(err);
					if (success) {
						console.log(success);
						res.redirect('/groups/'+groupName);
					}
				})
			}
			else {
				res.redirect('/groups')
			}
		})
	}
}


exports.joinGroup = function(req, res) {
	var userId = req.session._movesId
	,   groupName = req.params.groupName;

	user.joinGroup(userId, groupName, function(err, success) {
		if (err)  {
			log.error(err);
			log.error('error joining group');
			res.redirect('back');
		}
		if (success) {
			console.log(success);
			res.redirect('/groups/:'+groupName);
		}
	})
}
