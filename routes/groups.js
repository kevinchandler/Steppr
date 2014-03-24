var groups = require('../libs/groups.js');

exports.index = function(req, res) {
	groups.displayGroups(function(err, groups) {
		console.log('inside of displayGroups callback');
		if (err) { console.log(err) }
		res.render('groups.jade', { groups: groups });
	})
}


exports.createGroup = function(req, res) {

}
