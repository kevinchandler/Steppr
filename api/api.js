var steppr = require('../libs/steppr.js')
,   user = require('../libs/user.js')
,   groups = require('../libs/groups.js');



exports.stats = function(req, res) {
  steppr.stats(function(err, data) {
    if (err) return err;
    res.json(data)
  })
}


exports.userStepsToday = function(req, res) {
  if (!req.session._movesId) { return res.end(); }
  var movesId = req.session._movesId;
  user.getUserSteps(movesId, function(err, data) {
    if (err) return err;
    res.json(data);
  })
}


exports.viewAllGroups = function(req, res) {
  groups.viewAllGroups(function(err, data) {
    if (err) return err;
    res.json(data);
   })
}

exports.viewGroup = function(req, res) {
  groupName = req.params.group;
  groups.viewGroup(groupName, function(err, data) {
    if (err) return err;
    res.json(data);
  })
}
