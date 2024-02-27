const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Category")
require("../models/Post")
require("../models/User")
const Category = mongoose.model("categories")
const Post = mongoose.model("posts")
const User = mongoose.model("users")
const { admin } = require("../helpers/admin")
const bcrypt = require("bcryptjs")

router.get('/', admin, (req, res) => {
    const options = [
        { name: "Categories", id: "category", route: "/admin/categories" },
        { name: "Posts", id: "post", route: "/admin/posts" },
        { name: "Users", id: "user", route: "/admin/users" },
    ]
    res.render("admin/index", { options })
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
    Category.findOne({ _id: req.body.id }).lean().then((category) => {
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

router.post("/categories/delete", admin, (req, res) => {
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
    }).catch(() => {
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

router.get("/posts/delete/:id", admin, (req, res) => {
    Post.deleteOne({ _id: req.params.id }).then(() => {
        req.flash("success_msg", "Post deleted with success!")
        res.redirect("/admin/posts")
    }).catch(() => {
        req.flash("error_msg", "There was an error trying to delete post!")
        res.redirect("/admin/posts")
    })
})

//Users

router.get('/users', admin, (req, res) => {
    User.find().lean().sort({ name: "asc" }).then((users) => {
        res.render("admin/users", { users })
    }).catch(() => {
        req.flash("error_msg", "There was an error searching for users.")
        req.redirect("/admin")
    })
})

router.get('/users/edit/:id', admin, (req, res) => {
    User.findOne({ _id: req.params.id }).lean().then((user) => {
        res.render("admin/editUser", { user})
    }).catch(() => {
        req.flash("error_msg", "This user doesn't exist!")
        res.redirect("/admin/users")
    })
})

router.post('/users/edit', admin, (req, res) => {
    let errors = []
    if (req.body.password) {
        if (req.body.password.length < 4) {
            errors.push({ text: "Password is too short" })
        }
        if (req.body.password !== req.body.password2) {
            errors.push({ text: "Passwords are different, try again!" })
        }
    }
    if (errors.length > 0) {
        res.render("users/signIn", { errors })
    } else {
        User.findOne({ _id: req.body.id }).then((user) => {
            user.name = req.body.name
            user.email = req.body.email
            /* user.admin = req.body.admin ? 1 : 0 */
            if (req.body.password) {
                let salt = bcrypt.genSaltSync(10)
                let hash = bcrypt.hashSync(req.body.password, salt)
                user.password = hash
            }
            user.save().then(() => {
                req.flash("success_msg", "User edited with success!")
                res.redirect("/admin/users")
            }).catch(() => {
                req.flash("error_msg", "There was an error trying to save user's edition!")
                res.redirect("/admin/users")
            })
        })
    }
})

router.post("/users/delete", admin, (req, res) => {
    User.deleteOne({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "User deleted with sucess!")
        res.redirect("/admin/users")
    }).catch(() => {
        req.flash("error_msg", "There was an error trying to delete user!")
        res.redirect("/admin/users")
    })
})


module.exports = router