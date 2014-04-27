var steppr = require('../libs/steppr.js')
,   user = require('../libs/user.js')
,   groups = require('../libs/groups.js')
,   connection = require('../libs/mongo_connection.js');


exports.login = function(req, res) {
  if (req.session._token && req.session._movesId) {
    res.redirect('/#/home');
  }
  else {
    res.redirect('/moves');
  }
}
