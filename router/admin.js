const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const dialog = require('dialog')
const { password } = require('../db/db_config');
const config = require('../db/db_config');
router.get('/adminlogin', (req, res) => {
    console.log(req.session.user);

    res.render('adminlogin', {
        isLogin: false
    })
})

router.post('/adminlogin', (req, res) => {
    const _adminnum = req.body.adminnum;
    const _password = req.body.apassword;

    oracledb.getConnection(config, function(err, connection) {
        if (err) { console.log(err.message); return; }

        var query = `SELECT * FROM administrators WHERE Adminnum = '${_adminnum}' AND APASSWORD = '${_password}'`
        connection.execute(query, function(err, result) {
            if (err) {
                console.error(err.message);

                doRelease(connection);
                return;
            }
            isLogin = true
            doRelease(connection, result.rows);
        });
    });

    function doRelease(connection, user) {
        connection.close(function(err) {
            if (err) {
                console.error(err.message);
                res.redirect('/adminlogin');
            }

            console.log(user);
            if (user.length == 1) {
                res.redirect('/adminindex');
                req.session.user = { isLogin: true, adminname: user[0][2] };
                console.log(req.session.user);
            } else { res.redirect('/admin/adminlogin'); }
        })
    }
})
router.get('/logout', (req, res) => {
    req.session.user = null
    if (req.session.user == null || req.session.user == undefined) {
        res.redirect('/')
        isLogin = false
    } else {
        return false
    }
})


module.exports = router