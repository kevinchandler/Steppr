
var user = require('../libs/user')
,   steppr = require('../libs/steppr');

exports.home = function(req, res) {
    // update db with past months steps.
    if (req.session._token && req.session._movesId) {
        user.updateUser(req.session._token, req.session._movesId, function(err, success) {
            if( err ) {
                res.end(500);
            }
        })
    }
    else {
        res.redirect('/');
    }

    user.steps(req.session._movesId, function( err, data ){
        console.log('inside  user.step callback')
        if (err) res.send('i\'m broke like you: biaaaaatch ');
        if (data) {
            var totalUserSteps = data.steps;
            console.log('user: ' + totalUserSteps);

            steppr.getTotalSteps(function(payload) {
                console.log('inside  steppr.getTotal callback');

                if (payload) {
                    var totalStepsToday = payload.totalSteps
                    ,   userPercentage =  ((totalUserSteps / totalStepsToday) * 100).toFixed(0)
                    ,   usersToday = payload.usersToday;
                    console.log( 'total steps today: ' + totalStepsToday + '\n total users today: ' + usersToday );

                    res.render('home.jade', {
                        totalUserSteps : totalUserSteps,
                        totalStepsToday : totalStepsToday,
                        userPercentage : userPercentage,
                        usersToday : usersToday,
                    })
                }
            })
        }
    })






}
