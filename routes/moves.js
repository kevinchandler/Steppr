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
      "refreshToken":""
  });

    // Redirect your user to this url
    var url = moves.generateAuthUrl();

    moves.getAccessToken(req.query.code, function(err, body) {
        console.log(body);
          if (err) return res.redirect('/');

          // required for moves-api
          moves.options.accessToken = body.access_token;
          moves.getProfile(function(err, profile) {
            if (err) {
                res.send('unable to get moves profile info - 565');
            }
            else if (body.access_token && profile.userId) {
                req.session._token = body.access_token;
                req.session._movesId = profile.userId;
                console.log('sessions set: ' + req.session._token, req.session._movesId);
            }
              // checks db to see if there's a user
              MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
                    if (err) {
                      return err;
                    }
                    db.collection('users').findOne({user: req.session._movesId}, function(err, user) {
                      if (err) { res.send(err) } ;
                      else if (user) {
                            res.redirect('/home');
                      }
                      else if (!user) {
                          var  placeholder = '';
                          db.collection('users').insert({
                              user: req.session._movesId,
                              email: placeholder,
                              name: placeholder.toLowerCase(),
                              state : placeholder,
                              zipcode: placeholder,
                              points: {
                                  total: 0
                              },
                              badges: [],
                              groups: [],
                              access_token : body.access_token,
                              refresh_token : body.refresh_token
                          }, function(err, success) {
                              if (err) {
                                  res.send(err);
                              }
                              if (success) {
                                  console.log(success);
                                  console.log('user registered successfully');
                                  res.redirect('/home');
                              }
                          })
                      }
                  })
                })
            })
        })
    }
