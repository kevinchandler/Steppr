var groups = require('../libs/groups.js')
,   user = require('../libs/user.js');

exports.index = function(req, res) {
	groups.displayGroups(function(err, groups) {
		console.log('inside of displayGroups callback');
		if (err) { console.log(err) }
		res.render('groups.jade', { groups: groups });
	})
}


exports.createGroup = function(req, res) {
	if (req.method == 'GET') {
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
		//create group here
	}
}
