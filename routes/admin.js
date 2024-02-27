const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Category")
require("../models/Post")
const Category = mongoose.model("categories")
const Post = mongoose.model("posts")
const { admin } = require("../helpers/admin")

router.get('/', admin, (req, res) => {
    const options = [
        {name: "Categories", id:"category", route:"/admin/categories"},
        {name: "Posts", id:"post", route:"/admin/posts"},
        {name: "Users", id:"user", route:"/admin/users"},
    ]
    res.render("admin/index", {options})
})

//Categories

router.get('/categories', admin, (req, res) => {
    Category.find().lean().sort({ date: "desc" }).then((categories) => {
        res.render("admin/categories", { categories })
    }).catch((err) => {
        req.flash("error_msg", "There was an error searching for categories.")
        req.redirect("/admin")
    })
})

router.get('/categories/add', admin, (req, res) => {
    res.render("admin/addCategory")
})

router.post('/categories/nova', admin, (req, res) => {

    let errors = []

    if (!req.body.name || typeof req.body.name === undefined || req.body.name === null) {
        errors.push({ text: "Invalid Name!" })
    }

    if (!req.body.slug || typeof req.body.slug === undefined || req.body.slug === null) {
        errors.push({ text: "Invalid Slug!" })
    }

    if (req.body.name.length < 3) {
        errors.push({ text: "Category's name is too short." })
    }

    if (errors.length > 0) {
        res.render("admin/addCategory", { errors })
    } else {
        const novaCategory = {
            name: req.body.name,
            slug: req.body.slug,
        }

        new Category(novaCategory).save().then(() => {
            req.flash("success_msg", "Category created with success!")
            res.redirect("/admin/categories")
        }).catch((err) => {
            req.flash("error_msg", "There was an error trying to save category!")
            res.redirect("/admin")
        })
    }
})

router.get('/categories/edit/:id', admin, (req, res) => {
    Category.findOne({ _id: req.params.id }).lean().then((category) => {
        res.render("admin/editCategory", { category })
    }).catch(() => {
        req.flash("error_msg", "This category doesn't exist!")
        res.redirect("/admin/categories")
    })
})

router.post('/categories/edit', admin, (req, res) => {
    Category.findOne({ _id: req.body.id }).then((category) => {
        category.name = req.body.name
        category.slug = req.body.slug
        category.save().then(() => {
            req.flash("success_msg", "Category edited with success!")
            res.redirect("/admin/categories")
        }).catch(() => {
            req.flash("error_msg", "There was an error trying to save category's edition!")
            res.redirect("/admin/categories")
        })
    }).catch(() => {
        req.flash("error_msg", "There was an error when editing category!")
        res.redirect("/admin/categories")
    })
})

router.post("/categories/deletar", admin, (req, res) => {
    Category.deleteOne({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Category deleted with sucess!")
        res.redirect("/admin/categories")
    }).catch(() => {
        req.flash("error_msg", "There was an error trying to delete category!")
        res.redirect("/admin/categories")
    })
})

//Posts

router.get("/posts", admin, (req, res) => {
    Post.find().lean().populate("category").sort({ data: "desc" }).then((posts) => {
        res.render("admin/posts", { posts })
    }).catch((errors) => {
        console.log(errors)
        req.flash("error_msg", "There was an error searching for posts.")
        res.redirect("/admin")
    })
})

router.get("/posts/add", admin, (req, res) => {
    Category.find().lean().then((categories) => {
        res.render("admin/addPosts", { categories })
    }).catch(() => {
        req.flash("error_msg", "There was an error when loading the form!")
        res.redirect("/admin")
    })
})

router.post("/posts/nova", admin, (req, res) => {

    let errors = []

    if (req.body.category == "0") {
        errors.push({ text: "Invalid category, please register a category!" })
    }

    if (errors.length > 0) {
        res.render("admin/addPosts", { errors })
    } else {
        const novaPost = {
            title: req.body.title,
            description: req.body.description,
            conteudo: req.body.conteudo,
            category: req.body.category,
            slug: req.body.slug
        }
        new Post(novaPost).save().then(() => {
            req.flash("success_msg", "Post published with sucess!")
            res.redirect("/admin/posts")
        }).catch(() => {
            req.flash("error_msg", "There was an error trying to save post!")
            res.redirect("/admin/posts")
        })
    }

})

router.get('/posts/edit/:id', admin, (req, res) => {
    Post.findOne({ _id: req.params.id }).lean().then((post) => {
        Category.find().lean().then((categories) => {
            res.render("admin/editPosts", { post, categories })
        }).catch(() => {
            req.flash("error_msg", "There was an error searching for categories.")
            res.redirect("/admin/posts")
        })
    }).catch(() => {
        req.flash("error_msg", "This post doesn't exist!")
        res.redirect("/admin/posts")
    })
})

router.post('/posts/edit', admin, (req, res) => {
    Post.findOne({ _id: req.body.id }).then((post) => {
        post.title = req.body.title
        post.slug = req.body.slug
        post.description = req.body.description
        post.conteudo = req.body.conteudo
        post.category = req.body.category
        post.save().then(() => {
            req.flash("success_msg", "Post edited with success!")
            res.redirect("/admin/posts")
        }).catch(() => {
            req.flash("error_msg", "There was an error trying to save post edition!")
            res.redirect("/admin/posts")
        })
    }).catch(() => {
        req.flash("error_msg", "There was an error when editing post!")
        res.redirect("/admin/posts")
    })
})

router.get("/posts/deletar/:id", admin, (req, res) => {
    Post.deleteOne({ _id: req.params.id }).then(() => {
        req.flash("success_msg", "Post deleted with success!")
        res.redirect("/admin/posts")
    }).catch(() => {
        req.flash("error_msg", "There was an error trying to delete post!")
        res.redirect("/admin/posts")
    })
})



module.exports = router