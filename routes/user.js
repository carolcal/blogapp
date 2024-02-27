const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/User")
const User = mongoose.model("users")
const bcrypt = require("bcryptjs")
const passport = require('passport')

router.get("/signIn", (req, res) => {
    res.render("users/signIn")
})

router.post("/signIn", (req, res) => {
    let errors = []

    if(!req.body.name || typeof req.body.name === undefined || req.body.name === null){
        errors.push({text: "Invalid Name!"})
    }
    if(!req.body.email || typeof req.body.email === undefined || req.body.email === null){
        errors.push({text: "Invalid Email!"})
    }
    if(!req.body.password || typeof req.body.password === undefined || req.body.password === null){
        errors.push({text: "Invalid Password!"})
    }
    if(req.body.password.length < 4){
        errors.push({text: "Password is too short"})
    }
    if(req.body.password !== req.body.password2){
        errors.push({text: "Passwords are different, try again!"})
    }
    if(errors.length > 0){
        res.render("users/signIn", {errors})
    }else{
        User.findOne({email: req.body.email}).lean().then((user) => {
            if(user){
                req.flash("error_msg", "This email is already been used.")
                res.redirect("/users/signIn")
            }else{
                let salt = bcrypt.genSaltSync(10)
                let hash = bcrypt.hashSync(req.body.password, salt)
                const novoUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: hash,
                })

                novoUser.save().then(() => {
                    req.flash("success_msg", "User created with success!")
                    res.redirect("/")
                }).catch(() => {
                    req.flash("error_msg", "Error saving user, try again!")
                    res.redirect("/users/signIn")
                })

            }
        }).catch(() => {
            req.flash("error_msg", "Intern Error")
            res.redirect("/")
        })
    }
})

router.get("/login", (req, res) => {
    res.render("users/login")
})

router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/users/login",
        failureFlash: true
    })(req, res, next)
})

router.get("/logout", (req, res) => {
    req.logout((err) => {
        if(err){
            req.flash("error_msg", "Error when logging out!")
        }else{
            req.flash("success_msg", "Succesfully logged out!")
        }
        res.redirect("/")
    })
})

module.exports = router