const UserModel = require("../Models/user")
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
const CourseModel = require("../Models/course");

cloudinary.config({
    cloud_name: 'dkdeuzdd9',
    api_key: '651289575525313',
    api_secret: 'U1ld987D8BNQz8Q2pN_wCAgVHsI'
});

class FrontendController {
    static login = async (req, res) => {
        //console.log()
        try {
            res.render('login', { message: req.flash('success') })
        } catch (error) {
            console.log(error)
        }
    }

    static register = async (req, res) => {
        try {
            res.render('register', { message: req.flash('error') })
        } catch (error) {
            console.log(error)
        }
    }

    static dashboard = async (req, res) => { 
        try {
            const { name, image, _id } = req.data1
            const btech = await CourseModel.findOne({ user_id: _id, course: 'B.Tech' })
            const bca = await CourseModel.findOne({ user_id: _id, course: 'BCA' })
            const mca = await CourseModel.findOne({ user_id: _id, course: 'MCA' })
            res.render('dashboard', { n: name, img: image, b: btech, bca: bca, mca: mca })
        } catch (error) {
            console.log(error)
        }
    }

    static about = async (req, res) => {
        try {
            const { name, image } = req.data1
            res.render('about', { n: name, img: image })
        } catch (error) {
            console.log(error)
        }
    }

    static contact = async (req, res) => {
        try {
            const { name, image } = req.data1
            res.render('contact', { n: name, img: image })
        } catch (error) {
            console.log(error)
        }
    }

    static userinsert = async (req, res) => {
        // console.log(req.body)
        const { name, email, password, ConfirmPassword } = req.body
        const image = req.files.image
        //console.log(image)
        const imageupload = await cloudinary.uploader.upload(image.tempFilePath, {
            folder: 'profileimage'
        })
        //console.log(imageupload)
        const user = await UserModel.findOne({ email: email })
        //console.log(user)
        if (user) {
            req.flash('error', 'email already exist')
            res.redirect('/register')
        } else {
            if (name && email && password && ConfirmPassword) {
                if (password == ConfirmPassword) {
                    try {
                        const hashpassword = await bcrypt.hash(password, 10);
                        //console.log(hashpassword);
                        const result = new UserModel({
                            name: name,
                            email: email,
                            password: hashpassword,
                            image: {
                                public_id: imageupload.public_id,
                                url: imageupload.secure_url,
                            },
                        })
                        await result.save()
                        req.flash('success', 'registration successfully please login')
                        res.redirect('/')
                    } catch (error) {
                        console.log(error)
                    }
                } else {
                    req.flash('error', 'password and Confirmpassword does not match')
                    res.redirect('/register')
                }
            } else {
                req.flash('error', 'all feild are required')
                res.redirect('/register')
            }
        }
    }

    static verifylogin = async (req, res) => {
        //console.log(req.body)
        try {
            const { email, password } = req.body;
            if (email && password) {
                const user = await UserModel.findOne({ email: email })
                if (user != null) {
                    const isMatched = await bcrypt.compare(password, user.password)//
                    //console.log(req.body)
                    if (isMatched) {
                        if (user.role == 'student') {
                            const token = jwt.sign({ ID: user._id }, 'Baba@success1511130311090810');
                            //console.log(token)
                            res.cookie('token',token)
                            res.redirect('/dashboard')      
                        }
                        if (user.role == 'admin') {
                            const token = jwt.sign({ ID: user._id }, 'Baba@success1511130311090810');
                            //console.log(token)
                            res.cookie('token',token)
                            res.redirect('/admin/dashboard')
                        }

                    } else {
                        req.flash('error', 'Email or password is not valid')
                        return res.redirect('/')
                    }
                } else {
                    req.flash('error', 'You are not a registered user')
                    return res.redirect('/')
                }
            } else {
                req.flash('error', 'All Fields Required')
                return res.redirect('/')
            }
        } catch (err) {
            console.log(err);
        }
    }

    static logout = async (req, res) => {
        try {
            res.clearCookie('token')
            res.redirect('logout')
        } catch (error) {
            console.log(error)
        }
    }

    static profile = async (req, res) => {
        try {
            const { name, image, email } = req.data1
            res.render('profile', { n: name, img: image, e: email })

        } catch (error) {
            console.log(error)
        }
    }

    static updatepassword = async (req, res) => {
        try {
            const { id } = req.data1
            const { old_password, new_password, cpassword } = req.body;
            if (old_password && new_password && cpassword) {
                const user = await UserModel.findById(id);
                const ismatch = await bcrypt.compare(old_password, user.password);
                if (!ismatch) {
                    req.flash("error", "Old password is incorrect.");
                    return res.redirect("/profile");
                } else {
                    if (new_password !== cpassword) {
                        req.flash("error", "Password and confirm password do not match.");
                        return res.redirect("/profile");
                    } else {
                        const newHashpassword = await bcrypt.hash(new_password, 10);
                        await UserModel.findByIdAndUpdate(id, {
                            $set: { password: newHashpassword },
                        });
                        req.flash(
                            "success",
                            "Password changed successfully. Please log in with your new password."
                        );
                        return res.redirect("/logout");
                    }
                }
            } else {
                req.flash("error", "All fields are required.");
                return res.redirect("/profile");
            }
            // console.log(req.body)
        } catch (error) {
            console.log(error)
        }
    }

    static updateprofile = async (req, res) => {
        try {
            const { id } = req.data1
            //console.log(req.body)
            //console.log(req.files.image)
            if (req.files) {
                const user = await UserModel.findById(id);//
                const image_id = user.image.public_id;
                await cloudinary.uploader.destroy(image_id);

                const file = req.files.image;
                const myimage = await cloudinary.uploader.upload(file.tempFilePath, {
                    folder: "studentimage",

                });
                var data = {
                    name: req.body.name,
                    email: req.body.email,
                    image: {
                        public_id: myimage.public_id,
                        url: myimage.secure_url,
                    },
                };
            } else {
                var data = {
                    name: req.body.name,
                    email: req.body.email,
                }
            }
            const update_profile = await UserModel.findByIdAndUpdate(id, data)
            res.redirect('/profile')
        } catch (error) {
            console.log(error)
        }
    }
}



module.exports = FrontendController