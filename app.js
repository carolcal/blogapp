//Carregando módulos
    const express = require('express')
    const handlebars = require('express-handlebars')
    const app = express()
    const admin = require("./routes/admin")
    const path = require("path")
    const mongoose = require("mongoose")
    const session = require("express-session")
    const flash = require("connect-flash")
    require("./models/Postagem")
    const Postagem = mongoose.model("postagens")
    require("./models/Categoria")
    const Categoria = mongoose.model("categorias")
    const usuarios = require("./routes/usuario")
    const passport = require("passport")
    require("./config/auth")(passport)


//Configurações
    //Sessão
        app.use(session({
            secret: "secret",
            resave: true,
            saveUnitialized: true
        }))
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())
    //MIddleware
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
            console.log("Conectado ao mongo")
        }).catch((erro) => {
            console.log("Erro ao se conectar: " + erro)
        })
    //Public
        app.use(express.static(path.join(__dirname, "public")))

//Rotas
    app.get('/', (req, res) => {
        Postagem.find().lean().populate("categoria").sort({date: "desc"}).then((postagens) => {
            res.render("index", {postagens})
        }).catch(() => {
            req.flash("error_msg", "Houve um erro buscando postagens")
            res.redirect("/404")
        })
    })
    app.get('/postagem/:slug', (req, res) => {
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
            if(postagem){
                res.render("postagem/index", {postagem})
            }else{
                console.log('nao tem post')
                req.flash("error_msg", "Esta postagem não existe")
                res.redirect("/")
            }
        }).catch(() => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    })

    app.get('/categorias', (req, res) => {
        Categoria.find().lean().then((categorias) => {
            res.render("categorias/index", {categorias})
        }).catch(() => {
            req.flash("error_msg", "Erro ao listar categorias")
            res.redirect("/")
        })
    })

    app.get('/categorias/:slug', (req, res) => {
        Categoria.findOne({slug: req.params.slug}).then((categoria) => {
            if(categoria){
                Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                    res.render("categorias/postagens", {postagens, categoria})
                }).catch(() => {
                    req.flash("error_msg", "Erro ao listar postagens")
                    res.redirect("/")
                })

            }else{
                req.flash("error_msg", "Esta categoria não existe")
                res.redirect("/")
            }
        }).catch(() => {
            req.flash("error_msg", "Erro ao carregar postagens dessa categoria")
            res.redirect("/")
        })
    })

    app.get('/404', (req, res) => {
        res.send("Erro 404!")
    })
    app.use('/admin', admin)
    app.use("/usuarios", usuarios)

//Outros
    const PORT = 8081
    app.listen(PORT, () => {
        console.log("Servidor rodando!")
    })