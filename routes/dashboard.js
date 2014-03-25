
var user = require('../libs/user')
,   steppr = require('../libs/steppr');


// turn 1000 into 1,000 etc etc

function delimitNumbers(str) {
  return (str + "").replace(/\b(\d+)((\.\d+)*)\b/g, function(a, b, c) {
    return (b.charAt(0) > 0 && !(c || ".").lastIndexOf(".") ? b.replace(/(\d)(?=(\d{3})+$)/g, "$1,") : b) + c;
  });
}

exports.home = function(req, res) {
    // update db with past months steps.
    if (!req.session._token || !req.session._movesId) {
        res.redirect('/');
    }
    user.updateUser(req.session._token, req.session._movesId, function(err, data) {
        console.log('inside user.updateUser callback: ---- User: ' + req.session._movesId);
        if( err ) {
            console.log('err user.updateUser ');
        }
        if (data) {
            user.steps(req.session._movesId, function( err, data ){
                console.log('inside  user.step callback: ---- User: ' + req.session._movesId )
                if (err) {
                    console.log('error connecting to db in user.steps')
                }
                if (data) {
                    var totalUserStepsToday = data.steps;

                    steppr.getTotalSteps(function(err, payload) {
                        if (err) res.send(err);
                        console.log('inside  steppr.getTotal callback');

                        if (payload) {
                            var totalStepsToday = delimitNumbers(payload.totalStepsToday)
                            ,   totalStepprSteps = delimitNumbers(payload.totalStepprSteps)
                            ,   userPercentage = ((totalUserStepsToday / payload.totalStepsToday) * 100).toFixed(1)
                            ,   usersToday = delimitNumbers(payload.usersToday);

                            console.log( 'total steps today: ' + totalStepsToday + '\n total users today: ' + usersToday );
                            console.log('rendering home.jade');
                            console.log(req.session._movesId + ' % is : ' + userPercentage);

                            return res.render('home.jade', {
                                totalUserStepsToday : delimitNumbers(totalUserStepsToday), // done here bc userPercentage uses
                                totalStepsToday : totalStepsToday,
                                totalStepprSteps : totalStepprSteps,
                                userPercentage : userPercentage,
                                usersToday : usersToday,
                            })
                        }
                        else {
                            return res.render('home.jade', {
                                totalUserStepsToday : totalUserStepsToday
                            })
                        }
                    })
                }
                else {
                    return res.render('home.jade', {
                        totalUserStepsToday : 'err, no data',
                    })
                }
            })
        }
        else {
            res.redirect('/');
        }
    })
}
