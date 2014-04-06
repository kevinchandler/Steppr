var steppr = require('../libs/steppr.js')
,	 connection = require('../libs/mongo_connection.js')
,   fs = require('fs')
,   Log = require('log')
,   log = new Log('debug', fs.createWriteStream('log.txt'));


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
      console.log('body is: ');
      console.log(body);
      if (err || !body.access_token) {
          log.error(err || 'moves.js: no access token. User did not authorize. ')
          console.log(err || 'moves.js: no access token. User did not authorize. ');
          return res.redirect('/');
      }
      // required for moves-api library
      moves.options.accessToken = body.access_token;
      req.session._token = body.access_token;

      moves.getProfile(function(err, profile) {
        if (err) {
            log.error(err, 'unable to get moves profile')
            console.log(err, 'unable to get moves profile: ');
            return res.redirect('/');
        }
        if (profile) {
          req.session._movesId = profile.userId;
          console.log('sessions set: ' + req.session._token, req.session._movesId);

          // checks db to see if there's a user
          connection(function(db) {
            if (!db) return callback(new Error + ' unable to connect to db');
              steppr.findUser(profile.userId, function(err, doc) {
                  if (err) { return err; }
                  if (doc) {
                      return res.redirect('#/home');
                  }
                  if (!doc) {
                      steppr.createNewUser(body.access_token, body.refresh_token, profile.userId, function(err, success) {
                          if (err) {
                              console.log(err + ' error: unable to create user');
                              return res.redirect('/');
                          }
                          if (success) {
                              console.log('Created new user: \n');
                              return res.redirect('#/register');
                          }
                          else {
                              console.log('unable to createNewUser \n');
                              return res.redirect('/');
                          }
                      })
                  }
              })
          })
        }
    })
  })
}
