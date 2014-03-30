var steppr = require('../libs/steppr.js');

function delimitNumbers(str, callback) {
    return (str + "").replace(/\b(\d+)((\.\d+)*)\b/g, function(a, b, c) {
        return (b.charAt(0) > 0 && !(c || ".").lastIndexOf(".") ? b.replace(/(\d)(?=(\d{3})+$)/g, "$1,") : b) + c;
    });
}

exports.index = function(req, res) {
    var ua = req.header('user-agent');
    steppr.getTotalSteps(function(err, payload) {
        if (err) {
            res.render('desktop.jade');
        }
        if (payload) {
            if (req.session._token && req.session._movesId) {
                res.redirect('/home');
            }
            else if (payload) {
                res.render('landing.jade', {
                    totalStepprSteps: delimitNumbers(payload.totalStepprSteps),
                    usersToday : payload.usersToday,
                    totalStepsToday : delimitNumbers(payload.totalStepsToday),
                });
            }
            if(!/mobile/i.test(ua)) {
                res.render('desktop.jade', {
                    totalStepprSteps: delimitNumbers(payload.totalStepprSteps),
                    usersToday : payload.usersToday,
                    totalStepsToday : delimitNumbers(payload.totalStepsToday),
                });
            }
        }
    })
}
