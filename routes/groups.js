var groups = require('../libs/groups.js');

exports.index = function(req, res) {
	groups.displayGroups(function(err, groups) {
		console.log('inside of displayGroups callback');
		if (err) { console.log(err) }
		res.render('groups.jade', { groups: groups });
	})
}


exports.createGroup = function(req, res) {
	// check users coll against movesId and see if user has a username
		// render setusername.jade
		// redirect back here
	// render creategroup.jade

}
