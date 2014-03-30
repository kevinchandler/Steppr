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
			if (err) {
				console.log('ERR UNABLE TO CRE8 GRP');
			}
			if (success) {
				console.log('GROUP CRE8TED PROFESSIONAL STYLE.');
				console.log(success);
				res.redirect('/groups');
			}
		})
	}
}
