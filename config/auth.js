localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

//Model de usuário
require("../models/User")
const User = mongoose.model("users")

module.exports = function (passport) {
    passport.use(new localStrategy({ usernameField: 'email', passwordField: "password" }, (email, password, done) => {
        User.findOne({ email: email }).lean().then((user) => {
            if (!user) {
                return done(null, false, { message: "This account doesn't exist!" })
            }
            bcrypt.compare(password, user.password, (erro, batem) => {
                if (batem) {
                    return done(null, user)
                } else {
                    return done(null, false, { message: "Incorrect Password!" })
                }
            })
        })
    }))
    //Salvar dados user na sessão assim que ele logar
    passport.serializeUser((user, done) => {
        done(null, user._id)
    })
    passport.deserializeUser((id, done) => {
        User.findById(id).then((user) => {
            done(null, user)
        }).catch(() => {
            done(null, false, { message: 'Something went wrong!' })
        })
    })

}