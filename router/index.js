const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const config = require('../db/db_config');
const dialog = require('dialog')
router.get('/', (req, res) => {
    oracledb.getConnection(config, function(err, connection) {
        if (err) { console.log(err.message); return; }

        var query = 'SELECT * FROM mask WHERE ROWNUM <= 3';
        connection.execute(query, function(err, result) {
            if (err) {
                console.error(err.message);

                doRelease(connection);
                return;
            }

            doRelease(connection, result.rows);
        });
    });

    function doRelease(connection, productList) {
        connection.close(function(err) {
            if (err) {
                console.error(err.message);
            }
            var i = 0;

            if (productList[i][1] == 0 && i < productList.length) {
                dialog.info('当前口罩' + productList[i][0] + '库存不足，请明天在预约时间再来进行预约')
            }

            // console.log(productList);
            res.render('home', {
                isLogin: false,
                user: req.session.user,
                data: productList
            });
        })
    }
})

module.exports = router;