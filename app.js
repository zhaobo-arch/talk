const { request } = require('express');

const express = require('express');
const path = require('path')
const session = require('express-session');

const flash = require('connect-flash')
    // const oracleDbStore = require('express-oracle-session')(session);
const bodyParser = require('body-parser');
const indexRouter = require('./router/index');
const productRouter = require('./router/product');
const userRouter = require('./router/user');

const adminRouter = require('./router/admin')
const adminindexRouter = require('./router/adminindex')
const checklogin = require('./router/check')
const dbconfig = require('./db/db_config');
const depd = require('depd');
const app = express();
// var sessionStore = new oracleDbStore(dbconfig);
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    // store: sessionStore,
    resave: true,
    saveUninitialized: true
}));
app.use(flash())
    // 全局配置消息提示框
app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    next()
})
app.set('views, ', './views');
app.set('views', path.join(__dirname, 'views')); //注意path要require一下
app.set('view engine', 'ejs');
app.locals.pretty = true;
app.use(express.static(path.join(__dirname, './public')));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', function(req, res) {

    res.redirect('/checklogin')
})
app.use((req, res, next) => {
    if (req.url == '/user/login' || req.url == '/checklogin') {
        next()
    } else {
        if (req.session && req.session.phonenum != '') {
            req.app.locals['phonenum'] = req.session.phonenum
            next()
        } else {
            res.redirect('/login')
        }

    }
})

app.use('/checklogin', checklogin)
app.use('/index', indexRouter);
app.use('/user', userRouter);
app.use('/product', productRouter);
app.use('/adminindex', adminindexRouter)
app.use('/admin', adminRouter)

app.listen(4000, () => {
    console.log('Express server is running');
})