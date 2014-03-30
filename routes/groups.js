var groups = require('../libs/groups.js')
,   user = require('../libs/user.js')
,   fs = require('fs')
,   Log = require('log')
,   log = new Log('debug', fs.createWriteStream('logs/libs-groups-log.txt', {"flags": "a"}));


exports.index = function(req, res) {
	groups.displayGroups(function(err, groups) {
		console.log('inside of displayGroups callback');
		if (err) { console.log(err) }
		res.render('groups.jade', { groups: groups });
	})
}

exports.createGroup = function(req, res) {
	if ( req.method == 'GET' ) {
		user.isRegistered(req.session._movesId, function(err, isRegistered) {
			if (err) {
				log.error(err);
				res.redirect('back');
			}
			if (!isRegistered) {
				res.redirect('/user/register');
			}
			if (isRegistered) {
				res.render('creategroup.jade')
			}
		})
	}
	if ( req.method === 'POST' ) {
		groups.createGroup(req.body.groupName, req.session._movesId, function(err, success) {
			console.log('inside createGroup callback');
			if (err) return console.log(err);
			if (success) {
				user.joinGroup(req.session._movesId, req.body.groupName, function(err, success) {
					if (err) return console.log(err);
					if (success) {
						console.log(success);
						res.redirect('/groups');
					}
				})
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
