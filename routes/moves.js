// authenticate the user and set a session.
// redirects to /login
exports.authenticate = function(req, res) {
  var movesApi = require('moves-api').MovesApi;
  var moves = new movesApi({
      "clientId": process.env.CLIENT_ID,
      "clientSecret": process.env.CLIENT_SECRET,
      "redirectUri": process.env.REDIRECT_URL,
      "accessToken": "",
  });

  // Redirect your user to this url
  var url = moves.generateAuthUrl();

moves.getAccessToken(req.query.code, function(err, accessToken) {
      if (err) console.log(err);
      if (!accessToken) {
          return console.error('no accessToken');
      }

      // required for moves-api
      moves.options.accessToken = accessToken;

      moves.getProfile(function(err, profile) {
        if (err) {
            res.send('unable to get moves profile info - 565');
        }
        else if (accessToken) {
          req.session._token = accessToken;
          req.session._movesId = profile.userId;
          console.log('session moves id is ' + req.session._movesId);
          MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
              if (err) {
                  throw err;
              }
              db.collection('users').findOne({user: req.session._movesId}, function(err, user) {
                  if (err) { throw err };
                  if (user) {
                      req.session._email = user.email;
                      console.log('set email session to: ' + req.session._email);
                      console.log('found user, redirecting');
                      return res.redirect('/update');
                  }
                  else if (!user) {
                      console.log('no found user, redirecting');
                      return res.redirect('/register');
                  }
              })
          })
        }
      });
  })
}
