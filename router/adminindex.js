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

            // console.log(productList);
            res.render('adminindex', {
                isLogin: false,
                data: productList
            });
        })
    }
})

router.get('/editadd', (req, res) => {
    res.render('add', {

    })
})
router.post('/add', (req, res) => {
        //    口罩类型
        const _mtype = req.body.mtype
        const stocknum = req.body.Stocknum
        console.log(_mtype + stocknum);
        oracledb.getConnection(config, function(err, connection) {
            if (err) { console.log(err.message); return; }
            var query = `update mask set Stocknum=:0 where mtype='${_mtype}'`

            connection.execute(query, [stocknum], { autoCommit: true }, function(err, result) {

                if (err) {
                    console.log(err.message);

                    doRelease(connection);
                    return;
                }
                console.log(result);
                doRelease(connection, result.rowsAffected);
                dialog.info('设置口罩数量成功')
            });
            console.log('sql语句被执行了');

        });


        function doRelease(connection, result) {
            connection.close(function(err) {
                if (err) { console.log(err.message); }
                res.redirect('/adminindex')
            })
        }

    })
    // 根据口罩id增加口罩的库存数量
router.post('/add ', (req, res) => {
        oracledb.getConnection(config, function(err, connection) {
            if (err) {
                console.log(err.message);
                return;
            }
            var query = `update mask set Stocknum=:0 where mtype=${_mtype}`
            connection.execute(query, [stocknum], function(err, result) {
                if (err) {
                    console.error(err.message);
                    doRelease(connection)
                    return;
                }
                doRelease(connection, result.rowsAffected)
            })
            console.log('口罩数量被更新了');
        })

        function doRelease(connection, result) {
            connection.close(function(err) {
                if (err) { console.log(err.message); }
                res.redirect('/adminindex')
            })
        }
        // 口罩库存
    })
    // 编辑页面
router.get('/edit', (req, res) => {
        res.render('edit', {

        })
    })
    // 设置预约数量
router.post('/setRes', (req, res) => {
    // StartTime	开始时间
    // EndTime	结束时间
    // Userlimit	预约上限
    // Personallimit	个人口罩数量上限
    // Companylimit	单位口罩数量上限
    // to_date(to_char(time, 'yyyy-MM-dd'), 'yyyy-mm-dd')
    const numb = 1
    const userlimit = req.body.Userlimit;
    const personallimit = req.body.Personallimit
    const companylimit = req.body.Companylimit
        // var d = new Date(starttime)
        // var e = new Date(endtime)
        // starttime = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
        // endtime = e.getFullYear() + '-' + (e.getMonth() + 1) + '-' + e.getDate();
    console.log(userlimit + personallimit + companylimit);
    oracledb.getConnection(config, function(err, connection) {
        if (err) { console.log(err.message); return; }

        // var query = `insert into admin(Numb,StartTime,EndTime,Userlimit,Personallimit,Companylimit) 
        // values(admin_seq.nextval,:to_date(to_char(starttime, 'yyyy-MM-dd'), 'yyyy-mm-dd'),:to_date(to_char(endtime, 'yyyy-MM-dd'),'yyyy-mm-dd'),:userlimit,:personallimit,:companylimit) `

        // var query = `update admin set Userlimit=:0,Personallimit=:1,Companylimit=:2 where Numb=${numb}`
        var query = `update admin set Userlimit=:0,Personallimit=:1 where Numb=${numb}`
        var query2 = `update admin set Companylimit=:0 where Numb=${numb}`
        connection.execute(query, [userlimit, personallimit], { autoCommit: true }, function(err, result) {

            if (err) {
                console.log(err.message);

                doRelease(connection);
                return;
            }
            console.log(result);
            dialog.info('设置预约用户数量上限和用户预约口罩数量上限成功')
        });
        connection.execute(query2, [companylimit], { autoCommit: true }, function(err, result) {

            if (err) {
                console.log(err.message);

                doRelease(connection);
                return;
            }
            console.log(result);
            doRelease(connection, result.rowsAffected);
        });
        console.log('sql语句被执行了');

    });


    function doRelease(connection, result) {
        connection.close(function(err) {
            if (err) { console.log(err.message); }
            res.redirect('/adminindex')
        })
    }

})
module.exports = router;