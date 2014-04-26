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


exports.migrate = function(req,res) {
  connection(function(db) {
    if (!db) return callback(new Error + ' unable to connect to db');
    db.collection('steps').find().each(function(err, stepsDoc){
      console.log(stepsDoc);
      if (err) { return callback (err) }
      if (stepsDoc && stepsDoc.steps) {
        var package = {
          date : stepsDoc.date,
          steps : stepsDoc.steps,
        }
        db.collection('users').update({user : stepsDoc.user}, { $push : { 'steps.daily' : package }}, function(err, success) {
          if (err) console.log(err);
          if (success) console.log(user + ' collection updated successfully, ' + stepsDoc.date, stepsDoc.steps);
        })
      }
      if (!stepsDoc) {
        return res.end('done', 200);
      }
    })
  })
}
