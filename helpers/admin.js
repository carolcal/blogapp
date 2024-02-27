module.exports = {
    admin: function(req, res, next) {
        if(req.isAuthenticated() && req.user.admin === 1){
            return next();
        }
        req.flash("error_msg", "You must be an administrator to access this page!")
        res.redirect("/")
    }
}