
var user = require('../libs/user')
,   steppr = require('../libs/steppr');

function delimitNumbers(str) {
  return (str + "").replace(/\b(\d+)((\.\d+)*)\b/g, function(a, b, c) {
    return (b.charAt(0) > 0 && !(c || ".").lastIndexOf(".") ? b.replace(/(\d)(?=(\d{3})+$)/g, "$1,") : b) + c;
  });
}

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
                        var totalUserStepsToday = data.steps;
                        console.log('user steps: ' + totalUserStepsToday);

                        steppr.getTotalSteps(function(err, payload) {
                            if (err) res.send(err);
                            console.log('inside  steppr.getTotal callback');

                            if (payload) {
                                var totalStepsToday = delimitNumbers(payload.totalStepsToday)
                                ,   totalStepsLifetime = delimitNumbers(payload.totalStepsLifetime)
                                ,   userPercentage = ((totalUserStepsToday / payload.totalStepsToday) * 100).toFixed(1)
                                ,   usersToday = payload.usersToday;

                                console.log( 'total steps today: ' + totalStepsToday + '\n total users today: ' + usersToday );
                                console.log('rendering home.jade');
                                console.log('user % is : ' + userPercentage);

                                res.render('home.jade', {
                                    totalUserStepsToday : totalUserStepsToday,
                                    totalStepsToday : totalStepsToday,
                                    totalStepsLifetime : totalStepsLifetime,
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
