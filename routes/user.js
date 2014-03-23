var request = require('request')
,   moment = require('moment')
,   now = moment()
,   today = now.format("YYYY-MM-DD")
,   MongoClient = require('mongodb').MongoClient
,   dotenv = require('dotenv');
dotenv.load();

/*
 * GET home page.
 */
// register user info with moves id, their email, create db schema
exports.register = function(req, res) {
    if (req.method === 'GET') {
        res.render('register.jade');
    }
    else if (req.method === 'POST') {
        var email = req.body.email
        ,   first_name = req.body.firstname
        ,   zip_code = req.body.zipcode;
        req.session._email = email;
        if (!email || !first_name || !zip_code) {
            console.error('user lacking registration information');
            return res.redirect('/register');
        }
        // open db, check if new user, if not, /register, if so /authenticate
        MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
            var users = db.collection('users');
            if (err) {
                console.error('unable to connect to db. 105');
                return res.end('Unable to connect to db. Try again 105');
            }
            else if (db) {
                users.insert({
                    user: req.session._movesId,
                    email: email.toLowerCase(),
                    name: first_name.toLowerCase(),
                    zipcode: zip_code,
                    points: {
                        today: 0,
                        total: 0
                    },
                    opponent: undefined
                }, function(err, success) {
                    if (err) {
                        res.send(err);
                    }
                    else if (success) {
                        console.log(success);
                        console.log('user registered successfully');
                        res.redirect('/home');
                    }
                })
            }
            else {
                res.redirect('/');
                console.error('something went wrong when registering the user err 545');
            }
        })
    }

}
