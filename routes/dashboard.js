
var user = require('../libs/user')
,   steppr = require('../libs/steppr');

exports.home = function(req, res) {
    // update db with past months steps.
    if (req.session._token && req.session._movesId) {
        user.updateUser(req.session._token, req.session._movesId, req.session._email, function(err, success) {
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
        if (err) res.end('' + 500);
        if (data) {
            var totalUserSteps = data.steps;
            console.log('user: ' + totalUserSteps);
            steppr.getTotalSteps(function(totalSteps) {
                    if (totalSteps) {
                        var totalStepsToday = totalSteps
                        ,   userPercentage =  (totalUserSteps / totalStepsToday) * 100;
                        console.log(userPercentage);
                        console.log('total: ' + totalStepsToday);
                        res.render('home.jade', {
                            user : req.session._email,
                            totalUserSteps : totalUserSteps,
                            totalStepsToday : totalStepsToday,
                            userPercentage : userPercentage.toFixed(0)
                        })
                    }
            })
        }
    })






}
