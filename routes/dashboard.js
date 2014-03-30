
var user = require('../libs/user.js')
,   steppr = require('../libs/steppr.js')
,   fs = require('fs')
,   Log = require('log')
,   log = new Log('debug', fs.createWriteStream('logs/dashboard-log.txt', {"flags": "a"}));


function delimitNumbers(str, callback) {
    return (str + "").replace(/\b(\d+)((\.\d+)*)\b/g, function(a, b, c) {
        return (b.charAt(0) > 0 && !(c || ".").lastIndexOf(".") ? b.replace(/(\d)(?=(\d{3})+$)/g, "$1,") : b) + c;
    });
}

exports.home = function(req, res) {
    // update db with past months steps.
    if (!req.session._token || !req.session._movesId) {
         res.redirect('/');
    }
    else {
        user.updateUser(req.session._token, req.session._movesId, function(err, success) {
            if ( err ) {
                console.log(err);
                log.error(err);
            }
            // if (success) {
            //     log.info(success)
                user.getSteps(req.session._movesId, function( err, data ){
                    if (err) {
                        console.log('error connecting to db in user.steps')
                        log.error('error connecting to db in user.steps')
                    }
                    var totalUserStepsToday = data.steps;

                    steppr.getTotalSteps(function(err, payload) {
                        if (err) return err;
                        console.log('inside  steppr.getTotal callback');

                        if (payload) { // data retrieved from getTotalSteps callback
                            var totalStepsToday = delimitNumbers(payload.totalStepsToday)
                            ,   totalSteps = delimitNumbers(payload.totalSteps)
                            ,   userPercentage = ((totalUserStepsToday / payload.totalStepsToday) * 100).toFixed(1)
                            ,   usersToday = delimitNumbers(payload.usersToday);

                            console.log( 'total steps today: ' + totalStepsToday + '\n total users today: ' + usersToday );
                            log.info('rendering home.jade');
                            return res.render('home.jade', {
                                totalUserStepsToday : delimitNumbers(totalUserStepsToday), // done here bc userPercentage uses
                                totalStepsToday : totalStepsToday,
                                totalSteps : totalSteps,
                                userPercentage : userPercentage,
                                usersToday : usersToday,
                            })
                        }
                        else {
                            res.render('home.jade');
                            console.log('no success dashboard.js');
                            log.error('success: dashboard.js')
                        }
                    })
                })
            // }
        })
    }
}
