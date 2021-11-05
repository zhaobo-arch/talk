const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const config = require('../db/db_config');
const dialog = require('dialog')
router.get('/', (req, res) => {
    oracledb.getConnection(config, function(err, connection) {
        if (err) { console.log(err.message); return; }

        var query = 'SELECT * FROM mask WHERE ROWNUM <= 8';
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
            res.render('product', {
                isLogin: false,
                category: 1
            })
        })
    }
});

router.get('/detail/:mtype', (req, res) => {
    const _mtype = req.params.mtype;

    oracledb.getConnection(config, function(err, connection) {
        if (err) { console.log(err.message); return; }

        var query = `SELECT * FROM mask WHERE mtype = '${_mtype}'`
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

            console.log(productList[0])

            res.render('detail', {
                isLogin: true,
                data: productList,
            })
        })
    }

})


module.exports = router;