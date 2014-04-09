var steppr = require('../libs/steppr.js');

function delimitNumbers(str, callback) {
    return (str + "").replace(/\b(\d+)((\.\d+)*)\b/g, function(a, b, c) {
        return (b.charAt(0) > 0 && !(c || ".").lastIndexOf(".") ? b.replace(/(\d)(?=(\d{3})+$)/g, "$1,") : b) + c;
    });
}

exports.index = function(req, res) {
    var ua = req.header('user-agent');
    steppr.stats(function(err, payload) {
        if (err) {
            console.log(err);
            res.render('desktop.jade');
        }
        if (payload) {
            if (req.session._token && req.session._movesId) {
                res.redirect('/home');
            }
            if(!/mobile/i.test(ua)) {
                res.render('desktop.jade', {
                    totalSteps: delimitNumbers(payload.totalSteps),
                    usersToday : payload.usersToday,
                    totalStepsToday : delimitNumbers(payload.totalStepsToday),
                });
            }
            else {
                console.log('rendering landing.jade', payload.totalSteps, payload.usersToday, payload.totalStepsToday);
                res.render('landing.jade', {
                    totalSteps: delimitNumbers(payload.totalSteps),
                    usersToday : payload.usersToday,
                    totalStepsToday : delimitNumbers(payload.totalStepsToday),
                });
            }
        }
    })
}
