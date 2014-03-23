
var user = require('../libs/user')
,   steppr = require('../libs/steppr');

exports.home = function(req, res) {
    // update db with past months steps.
    if (!req.session._token || !req.session._movesId) {
        res.redirect('/moves');
    }
    if (req.session._token && req.session._movesId) {
        user.updateUser(req.session._token, req.session._movesId, function(err, data) {
            if( err ) {
                res.end(500);
            }
            else {
                user.steps(req.session._movesId, function( err, data ){
                    console.log('inside  user.step callback: ---- User: ' + req.session._movesId )
                    if (err) {
                        console.log('error connecting to db in user.steps')
                    }
                    if (data) {
                        var totalUserSteps = data.steps;
                        console.log('user steps: ' + totalUserSteps);

                        steppr.getTotalSteps(function(err, payload) {
                            if (err) res.send(err);
                            console.log('inside  steppr.getTotal callback');

                            if (payload) {
                                var totalStepsToday = payload.totalSteps
                                ,   userPercentage =  ((totalUserSteps / totalStepsToday) * 100).toFixed(0)
                                ,   usersToday = payload.usersToday;
                                console.log( 'total steps today: ' + totalStepsToday + '\n total users today: ' + usersToday );
                                console.log('rendering home.jade');
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
        })
    }
}
