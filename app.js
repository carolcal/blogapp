//Carregando módulos
    const express = require('express')
    const handlebars = require('express-handlebars')
    const app = express()
    const admin = require("./routes/admin")
    const path = require("path")
    const mongoose = require("mongoose")
    const session = require("express-session")
    const flash = require("connect-flash")
    require("./models/Post")
    const Post = mongoose.model("posts")
    require("./models/Category")
    const Category = mongoose.model("categories")
    const users = require("./routes/user")
    const passport = require("passport")
    require("./config/auth")(passport)


//Settings
    //Session
        app.use(session({
            secret: "secret",
            resave: true,
            saveUnitialized: true
        }))
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())
    //Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null
            next()
        })
    //Body Parser
        app.use(express.urlencoded());
        app.use(express.json());
    //Handlebars
        app.engine("handlebars", handlebars.engine({defaultLayout: "main"}))
        app.set("view engine", "handlebars")
    //Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect("mongodb://localhost/blogapp").then(() => {
            console.log("Connected to mongodb.")
        }).catch((erro) => {
            console.log("Error connecting: " + erro)
        })
    //Public
        app.use(express.static(path.join(__dirname, "public")))

//Routes
    app.get('/', (req, res) => {
        Post.find().lean().populate("category").sort({date: "desc"}).then((posts) => {
            console.log(posts)
            res.render("index", {posts})
        }).catch(() => {
            req.flash("error_msg", "There was an error searching for posts.")
            res.redirect("/404")
        })
    })
    app.get('/post/:slug', (req, res) => {
        Post.findOne({slug: req.params.slug}).lean().then((post) => {
            if(post){
                res.render("post/index", {post})
            }else{
                req.flash("error_msg", "This post doesn't exist.")
                res.redirect("/")
            }
        }).catch(() => {
            req.flash("error_msg", "Internal Error.")
            res.redirect("/")
        })
    })

    app.get('/categories', (req, res) => {
        Category.find().lean().then((categories) => {
            res.render("categories/index", {categories})
        }).catch(() => {
            req.flash("error_msg", "There was an error searching for categories.")
            res.redirect("/")
        })
    })

    app.get('/categories/:slug', (req, res) => {
        Category.findOne({slug: req.params.slug}).then((category) => {
            if(category){
                Post.find({category: category._id}).lean().then((posts) => {
                    res.render("categories/posts", {posts, category})
                }).catch(() => {
                    req.flash("error_msg", "There was an error searching for posts.")
                    res.redirect("/")
                })

            }else{
                req.flash("error_msg", "This category doesn't exist.")
                res.redirect("/")
            }
        }).catch(() => {
            req.flash("error_msg", "There was an error searching for this category posts.")
            res.redirect("/")
        })
    })

    app.get('/404', (req, res) => {
        res.send("404 Error!")
    })
    app.use('/admin', admin)
    app.use("/users", users)

//Others
    const PORT = 8081
    app.listen(PORT, () => {
        console.log("Server running!")
    })