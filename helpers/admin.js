module.exports = {
    admin: function(req, res, next) {
        if(req.isAuthenticated() && req.user.admin === 1){
            return next();
        }
        console.log('não é admin')
        req.flash("error_msg", "Você precisa ser um administrador para acessar essa página!")
        res.redirect("/")
    }
}