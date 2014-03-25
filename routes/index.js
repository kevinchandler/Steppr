var steppr = require('../libs/steppr.js');
/*
 * GET home page.
 */
exports.index = function(req, res) {
    // if (!req.session._token || !req.session._movesId) {
    //     res.render('landing.jade');
    // }
    // else {
    //     res.redirect('/home');
    // }
    steppr.getTotalSteps(function(err, payload) {
        if (err) {
            res.error;
        }
        if (payload) {
            res.render('landing.jade', {
                totalStepprSteps: payload.totalStepprSteps,
                usersToday : payload.usersToday,
                totalStepsToday : payload.totalStepsToday
            });
        }
    })


}
