const UserModel = require('../Models/user')

class UserController {
    static home = (req, res) => {
        res.render('home')
    }

    static about = (req, res) => {
        res.render('About')
    }

    static Team = (req, res) => {
        res.send("Team Page")
    }
}

module.exports = UserController