var request = require('request')
,   moment = require('moment')
,   now = moment()
,   today = now.format("YYYY-MM-DD")
,   MongoClient = require('mongodb').MongoClient
,   dotenv = require('dotenv');
dotenv.load();


function getData(movesId) {
    MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
        if (err) {
            return err;
        }
        db.collection('steps').findOne({ user: movesId, date: today }, function(err, userActivity) {
            if (err) { return err };
            if (userActivity) {
                return userActivity;
            }
            else {
                return null;
            }
        })
    })
}


function updateUser(sessionToken, sessionMovesId, sessionEmail) {

    if (!sessionToken) {
        res.redirect('/');
    }
    else { // user is authenticated and logged in
        request('https://api.moves-app.com/api/1.1/user/activities/daily?pastDays=31&access_token='+sessionToken, function(err, response, body) {
           try {
             var payload = JSON.parse(body);
           }
           catch(e) {
             console.log(e);
           }
           if (payload) { // parsed data from request
               MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
                   if (err) {
                       throw err;
                   }
                    // each of the 31 days retrieved from moves api, check to see if it's in the db, if so, make sure the # of steps match, update if not.
                    payload.forEach(function(moves_data) {
                       if (!moves_data.summary || !moves_data.segments) {
                           return console.error('end of moves or segment data');
                       }

                    moves_data.summary.forEach(function(activity) {
                       if (activity.steps) {
                           // format date from 20140201 -> 2014-02-01
                           var activity_date = moment(moves_data.date, "YYYYMMDD").format("YYYY-MM-DD")
                           ,   steps = activity.steps;

                               // checks to see if there's already a document in the db with the date from moves,
                               // updates db with # of steps from moves
                               var query = { user : sessionMovesId, date : activity_date };
                               db.collection('steps').findOne(query, function(err, doc) {
                                   if (err) throw err;
                                   else if (doc) { // if this date is in the db

                                       if (doc.steps !== steps) { // updates user's steps in db if it differs
                                           db.collection('steps').update({_id: doc._id}, {$set: { 'steps' : steps}}, function(err, success) {
                                               if (err) throw err;
                                               else if (success) {
                                                   console.log('Steps updated from ' + doc.steps + ' -> ' + steps + ': ' + doc.date + '\n');
                                                   return;
                                               }
                                           })
                                       }
                                   }
                                   else { // no data found for this date in our db, save it
                                       db.collection('steps').insert({
                                         "user"  : sessionMovesId,
                                         "email" : sessionEmail,
                                         "date"  : activity_date,
                                         "steps" : steps,
                                         "last_updated" : today,
                                       }, function(err, success){
                                         if (err) { throw err; }
                                         else {
                                             console.log('Data entered into db: \n')
                                             console.log(success);
                                         }
                                        })
                                    }
                               })
                           }
                       })
                   })
               })
           } //if payload
           else {
               res.send('didn\'t get anything back from moves. Are you sure you\'re attempting this from your phone?');
               return res.redirect('/');
           }
       })
    }
   // done.
   return;
}


exports.home = function(req, res) {

    updateUser(req.session._token, req.session._movesId, req.session._email, function(err, success) {
        console.log(err, success)
    });
    res.render('home.jade', {
        user: req.session._email
    })

}
