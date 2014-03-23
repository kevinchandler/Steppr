var MongoClient = require('mongodb').MongoClient;


// hit this route and it will authenticate with moves, then hit authenticate
exports.index = function(req, res){
    res.redirect('moves://app/authorize?client_id=1_SRAx6QvK94gDAOmds1yai52i5NDwbt&redirect_uri='+process.env.MOVES_REDIRECT_URL+'&scope=activity')
};


// sets session ._token with the returned token after authenticating with moves
// session ._movesId is moves user id
// looks through users collection to see if a user with the moves id is registered, if so returns true
// if we can't find a user, returns false

// after opening the moves app, it redirects here
exports.authenticate = function(req, res) {
  console.log('/authenticate');
  var movesApi = require('moves-api').MovesApi;
  var moves = new movesApi({
      "clientId": process.env.CLIENT_ID,
      "clientSecret": process.env.CLIENT_SECRET,
      "redirectUri": process.env.MOVES_REDIRECT_URL,
      "accessToken": "",
  });

    // Redirect your user to this url
    var url = moves.generateAuthUrl();

    moves.getAccessToken(req.query.code, function(err, accessToken) {
        console.log(accessToken)
          if (err) console.log(err);
          if (!accessToken) {
              console.error('no accessToken');
              res.redirect('/moves');
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
              res.redirect('/home');

              // checks db to see if there's a user
            //   MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
            //       if (err) {
            //           throw err;
            //       }
            //       db.collection('users').findOne({user: req.session._movesId}, function(err, user) {
            //           if (err) { throw err };
            //           if (user) {
            //               req.session._email = user.email;
            //               console.log('set email session to: ' + req.session._email);
            //               console.log('found user, ' + user.email + ' redirecting');
            //               return res.redirect('/home');
            //           }
            //           else if (!user) {
            //               console.log('no found user, redirecting');
            //               return res.redirect('/user/register');
            //           }
            //       })
            //   })
            }
            else {
                console.log('no accessToken');
                res.redirect('/moves');
            }
        });
    })
}
