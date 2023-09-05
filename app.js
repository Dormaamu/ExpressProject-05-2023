const express = require('express')
const app = express()
const port = 2023
const web = require('./Routes/web')
const connectdb = require('./db/dbcon')
const fileUpload = require("express-fileupload");

//cookies
const cookieParser = require('cookie-parser');
app.use(cookieParser())

//Temp file uploader
app.use(fileUpload({ useTempFiles: true }));

//connect flash and sessions
const session = require('express-session')
const flash = require('connect-flash');

//messages
app.use(session({
  secret: 'secret',
  cookie: { maxAge: 60000 },
  resave: false,
  saveUninitialized: false,
}));

//Flash messages
app.use(flash());

//connection
connectdb()

//Data Get
app.use(express.urlencoded({ extended: true }))

//route.load
app.use('/', web)

//EJS set html
app.set('view engine', 'ejs')

//Static files
app.use(express.static('public'))

//server create
app.listen(port, () => {
  console.log(`server start localhost:${port}`)
  //$=templating string
})

