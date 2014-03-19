
/*
 * GET home page.
 */

exports.index = function(req, res){
    res.redirect('moves://app/authorize?client_id=1_SRAx6QvK94gDAOmds1yai52i5NDwbt&redirect_uri='+process.env.MOVES_REDIRECT_URL+'&scope=activity')
};
