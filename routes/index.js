
/*
 * GET home page.
 */
exports.index = function(req, res) {
    if (!req.session._token || !req.session._movesId) {
        res.render('landing.jade');
    }
    else {
        res.redirect('/home');
    }

}
