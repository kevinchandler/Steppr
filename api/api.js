var steppr = require('../libs/steppr.js')
,   user = require('../libs/user.js')
,   groups = require('../libs/groups.js')
,   connection = require('../libs/mongo_connection.js');

exports.stats = function(req, res) {
  var today = req.body.date;
  steppr.stats(today, function(err, data) {
    if (err) return res.json(err);
    return res.json(data);
  })
}
//
// exports.activityToday = function(req, res) {
//   console.log(req.body);
//   var today = req.body.date;
//   steppr.activityToday(today, function(err, data) {
//     if (err) return res.json(err)
//     return res.json(data)
//   })
// }

exports.viewUser = function(req, res) {
  var username = req.params.username;
  user.viewUser(username, function(err, data) {
    console.log(data);
    if (err) return res.json(err);
    return res.json(data);
  })
}

exports.getSelf = function(req, res) {
  var userId = req.session._movesId;
  user.getSelf(userId, function(err, data) {
    console.log(data.stepsToday);
    if (err) return res.json(err);
    if (data) {
      return res.json(data);
    }
  })
}

exports.updateUser = function(req, res) {
  var accessToken = req.session._token
  ,   userId = req.session._movesId;
  user.updateUser(accessToken, userId, function(err, data) {
    // stuff here after updating.
  })
}

exports.registerUser = function(req, res) {
  var username = req.body.username
  // ,   email = req.body.email
  ,   state = req.body.state
  ,   userId = req.session._movesId;

  user.registerUser(userId, username, state, function(err, success) {
    if (err) return res.json(err);
    if (success) {
      return res.send(200);
    }
  })
}

exports.userStepsToday = function(req, res) {
  var today = req.body.date;
  if (!req.session._movesId) { return res.end(); }
  var movesId = req.session._movesId;
  user.getUserSteps(movesId, today, function(err, data) {
    if (err) return res.json(err);
    res.json(data);
  })
}

exports.viewAllGroups = function(req, res) {
  groups.viewAllGroups(function(err, data) {
    if (err) return res.json(err);
    res.json(data);
   })
}

exports.showGroup = function(req, res) {
  groupName = req.params.group;
  groups.showGroup(groupName, function(err, data) {
    if (err) return res.json(err);
    res.json(data);
  })
}

exports.joinGroup = function(req, res) {
  var userId = req.session._movesId
  ,   groupName = req.params.group;
  if (!req.session._movesId || !req.params.group) {
    return res.redirect('/');
  }
  user.joinGroup(userId, groupName,  function(err, data) {
    if (err) return res.json(err);
    res.json(data);
  });
}

exports.leaveGroup = function(req, res) {
  if (!req.session._movesId || !req.params.group) {
    return res.redirect('/');
  }

  var userId = req.session._movesId
  ,   groupName = req.params.group;

  user.leaveGroup(userId, groupName, function(err, data) {
    if (err) return res.json(err);
    return res.json(data);
  });
}

exports.createGroup = function(req, res) {
  var today = req.body.date;
  if (!req.session._movesId || !req.params.group) {
    return res.send('leaveGroup: missing data required to leave group');
  }

  var userId = req.session._movesId
  ,   groupName = req.params.group;

  user.createGroup(userId, groupName, today, function(err, data) {
    if (err) return res.json(err);
    return res.json(data);
  })
}

exports.challengeUser = function(req, res) {
  var date = req.body.date
  ,   challengee = req.body.challengee;
  if ( date && challengee ) {
    user.challengeUser(req.session._movesId, challengee, date, function(err, success) {
      if (err || !success) { res.send(500, err || 'challengeUser unsuccessful') };
      res.send(200);
    })
  }
  else {
    res.send(500, 'Unable to challenge user');
    log.info('Unable to challenge user');
  }
}
