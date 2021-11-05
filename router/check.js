const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const config = require('../db/db_config');
const dialog = require('dialog')
router.get('/', (req, res) => {
    res.render('checklogin', {
        isLogin: false
    })
})

module.exports = router;