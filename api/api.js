var steppr = require('../libs/steppr.js')
,   user = require('../libs/user.js')
,   groups = require('../libs/groups.js')
,   connection = require('../libs/mongo_connection.js');



exports.stats = function(req, res) {
  steppr.stats(function(err, data) {
    if (err) return res.json(err);
    res.json(data)
  })
}

exports.viewUser = function(req, res) {
  var username = req.params.username;
  user.viewUser(username, function(err, data) {
    if (err) return res.json(err);
    res.json(data);
  })
}

exports.getSelf = function(req, res) {
  var userId = req.session._movesId;
  user.getUser(userId, function(err, data) {
    if (err) return res.json(err);
    if (data) {
      res.json(data);
    }
    else {
      return res.end();
    }
  })
}

exports.updateUser = function(req, res) {
  var accessToken = req.session._token
  ,   userId = req.session._movesId;
  user.updateUser(accessToken, userId, function(err, data) {
    if (err) return res.json(err);
    if (data) {
      res.json(data);
    }
    else {
      return res.end();
    }
  })
}

exports.registerUser = function(req, res) {
  var username = req.body.username
  ,   userId = req.session._movesId;

  user.registerUser(userId, username, function(err, success) {
    if (err) return res.json(err);
    if (success) {
      res.send(200);
    }
    else {
      return res.end();
    }
  })
}

exports.userStepsToday = function(req, res) {
  if (!req.session._movesId) { return res.end(); }
  var movesId = req.session._movesId;
  user.getUserSteps(movesId, function(err, data) {
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

exports.viewGroup = function(req, res) {
  groupName = req.params.group;
  groups.viewGroup(groupName, function(err, data) {
    if (err) return res.json(err);
    res.json(data);
  })
}


exports.joinGroup = function(req, res) {
  if (!req.session._movesId || !req.params.group) {
    return callback('joinGroup: missing data required to join group');
  }

  var userId = req.session._movesId
  ,   groupName = req.params.group;

  user.joinGroup(userId, groupName, function(err, data) {
    if (err) return res.json(err);
    res.json(data);
  });
}

exports.leaveGroup = function(req, res) {
  if (!req.session._movesId || !req.params.group) {
    return callback('leaveGroup: missing data required to leave group');
  }

  var userId = req.session._movesId
  ,   groupName = req.params.group;

  user.leaveGroup(userId, groupName, function(err, data) {
    if (err) return res.json(err);
    res.json(data);
  });
}

exports.createGroup = function(req, res) {
  if (!req.session._movesId || !req.params.group) {
    return res.send('leaveGroup: missing data required to leave group');
  }

  var userId = req.session._movesId
  ,   groupName = req.params.group;

  user.createGroup(userId, groupName, function(err, data) {
    if (err) return res.json(err);
    res.json(data);
  })
}
