const jwt = require('jsonwebtoken')
const Usermodel = require('../Models/user')

const checkuserauth = async (req, res, next) => {
    //console.log('hello auth')  
    const { token } = req.cookies
    if (!token) {
        req.flash('error', 'unauthorized user,please login')
        res.redirect('/')
    } else {
        const verifytoken = jwt.verify(token, 'Baba@success1511130311090810')
        // console.log(verifytoken)   //
        const data = await Usermodel.findOne({ _id: verifytoken.ID })
        console.log(data)
        //req.data1 = data
        next()
    }
}
module.exports = checkuserauth