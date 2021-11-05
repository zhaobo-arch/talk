const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { password } = require('../db/db_config');
const config = require('../db/db_config');
const dialog = require('dialog')
router.get('/login', (req, res) => {
    res.render('login', {})
})

router.post('/login', (req, res) => {
    _phone = req.body.phonenum;
    _password = req.body.upassword;
    req.session.phonenum = _phone;
    console.log(req.session.phonenum);

    oracledb.getConnection(config, function(err, connection) {
        if (err) { console.log(err.message); return; }
        if (_phone.length !== 11) {
            dialog.info('电话输入错误，请您检查并且重新输入')
        }
        if (_password.length !== 6) {
            dialog.info('密码长度为6位，您输入错误')
            return;
        }
        var query = `SELECT * FROM subscriber WHERE PHONENUM = '${_phone}' AND UPASSWORD = '${_password}'`
        connection.execute(query, function(err, result) {
            if (err) {
                console.error(err.message);

                doRelease(connection);
                return dialog.info('登录出错了')
            }

            isLogin = true

            doRelease(connection, result.rows);
            dialog.info('登录成功')
        });

    });
    // return _phone

    function doRelease(connection, user) {
        connection.close(function(err) {
            if (err) {
                console.error(err.message);
                res.redirect('/login');
            }
            console.log(user + '1');
            if (user.length == 1) {
                res.redirect('/index');
                req.session.user = user;
                console.log(req.session.user[0]);
            } else { res.redirect('/user/login'); }
        })
    }
})
router.get('/register', (req, res) => {
    res.render('register', {
        isLogin: false
    })
})

// 注册功能
router.post('/register', (req, res) => {

    const _phonenum = req.body.phonenum;
    const _upassword = req.body.upassword
    const _uname = req.body.uname;
    const _area = req.body.area;
    const _utype = req.body.utype
    console.log('1');
    let errors = []
    if (req.body.upassword.length != 6) {
        errors.push({
            text: "密码的长度只能为6位"
        })
    }
    // db.get.execute("insert into users (id,name,password,email,role) values (user_id.nextval,:0,:1,:2,:3)", [name, password, email, role], { autoCommit: true }, function(err, result) {

    //     if (err)
    //         res.send("Error inside registration");
    //     else
    //         res.render("login");
    // });
    oracledb.getConnection(config, function(err, connection) {
        if (err) { console.log(err.message); return; }
        var query = `INSERT INTO subscriber(phonenum,upassword,uname,area,utype) VALUES(:0,:1,:2,:3,:4)`;

        connection.execute(query, [_phonenum, _upassword, _uname, _area, _utype], { autoCommit: true }, function(err, result) {
            console.log('sql语句被执行了');
            console.log(query);
            if (err) {
                console.log(err.message);

                doRelease(connection);
                return;
            }

            doRelease(connection, result.rowsAffected);
        });
    });


    function doRelease(connection, result) {
        connection.close(function(err) {
            if (err) { console.log(err.message); }
            console.log(result);
            res.redirect('/user/login');
        })
    }
})

function checkEmail(email) {
    return false;
}
router.get('/logout', (req, res) => {
    console.log('logout');
    console.log(req.session);
    req.session.user = null;

    if (req.session.user === null || req.session.user === undefined) {
        res.redirect('/');
        dialog.info('退出登录成功')
        isLogin = false
    } else {
        return false;
    }
})

// 个人信息详细界面
router.get('/text', (req, res) => {
    const _phoneid = req.session.phonenum
    oracledb.getConnection(config, function(err, connection) {
        if (err) { console.log(err.message); return; }
        var query = `select *from subscriber where phonenum='${_phoneid}'`
        connection.execute(query, function(err, result) {
            if (err) {
                console.error(err.message);
                doRelease(connection)
                return;
            }
            isLogin = true
            doRelease(connection, result.rows)
        })
    })

    function doRelease(connection, allmessage) {
        connection.close(function(err) {
            if (err) {
                console.error(err.message);
                req.flash("error")
            }
            res.render('mypage', {
                isLogin: true,
                data1: allmessage
            })
            if (allmessage.length == 0) {
                res.send('当前页面没有信息')
            }
        })
    }
})

// 预约口罩
router.get('/reserve', (req, res) => {
        res.render('first', {})
    })
    // 预约
router.post('/reserve', (req, res) => {

        const _masknum = req.body.masknum
        const _phonenum = req.body.phonenum;
        const _mtype = req.body.mtype
        oracledb.getConnection(config, function(err, connection) {
            if (err) {
                console.log(err.message);
                return;
            }
            var query = `INSERT INTO ord(Onum,Masknum,mtype,phonenum) VALUES(order_seq.nextval,:0,:1,:2)`;
            connection.execute(query, [_masknum, _mtype, _phonenum], { autoCommit: true }, function(err, result) {

                console.log(query);
                if (err) {
                    console.log(err.message);

                    doRelease(connection);
                    return;
                }
                dialog.info('恭喜您预约成功，您可以在订单结果当中查看您的预约记录')
                doRelease(connection)
            });
            // console.log(a1);
            // console.log(a2);

            function doRelease(connection, result) {
                connection.close(function(err) {
                    if (err) { console.log(err.message); }

                    res.redirect('/user/reserve');
                })
            }
        })
    })
    // 订单结果
router.get('/result', (req, res) => {
        const _phoneid = req.session.phonenum
        oracledb.getConnection(config, function(err, connection) {
            if (err) { console.log(err.message); return; }
            var query = `select *from ord where phonenum='${_phoneid}'`
            connection.execute(query, function(err, result) {
                if (err) {
                    console.error(err.message);
                    doRelease(connection)
                    return;
                }
                isLogin = true
                doRelease(connection, result.rows)
            })
        })

        function doRelease(connection, amessage) {
            connection.close(function(err) {
                if (err) {
                    console.error(err.message);
                    req.flash("error")
                }
                res.render('result', {
                    isLogin: true,
                    data2: amessage
                })
            })
        }
    })
    // 预约结果
router.get('/resordresult', (req, res) => {
        const _phoneid = req.session.phonenum
        let page = req.query.page
        let pagesize = 10

        oracledb.getConnection(config, function(err, connection) {
            if (err) { console.log(err.message); return; }
            var query = `select *from zhongqian where phonenum='${_phoneid}'`
            connection.execute(query, function(err, result) {
                if (err) {
                    console.error(err.message);
                    doRelease(connection)
                    return;
                }
                isLogin = true
                doRelease(connection, result.rows)
            })
        })

        function doRelease(connection, amessage1) {
            connection.close(function(err) {
                if (err) {
                    console.error(err.message);
                    req.flash("error")
                }
                res.render('maskres', {
                    isLogin: true,
                    data3: amessage1
                })
            })
        }
    })
    // 编辑信息
router.get('/editpro', (req, res) => {
    res.render('edituser')
})
router.post('/editpro', (req, res) => {
    const _phonenum = req.session.phonenum;
    const _upassword = req.body.upassword
    const _uname = req.body.uname;
    const _area = req.body.area;
    const _utype = req.body.utype
    oracledb.getConnection(config, function(err, connection) {
        if (err) { console.log(err.message); return; }

        // var query = `insert into admin(Numb,StartTime,EndTime,Userlimit,Personallimit,Companylimit) 
        // values(admin_seq.nextval,:to_date(to_char(starttime, 'yyyy-MM-dd'), 'yyyy-mm-dd'),:to_date(to_char(endtime, 'yyyy-MM-dd'),'yyyy-mm-dd'),:userlimit,:personallimit,:companylimit) `

        var query = `update subscriber set upassword=:0,uname=:1,area=:2,utype=:3 where phonenum=${_phonenum}`
        connection.execute(query, [_upassword, _uname, _area, _utype], { autoCommit: true }, function(err, result) {

            if (err) {
                console.log(err.message);

                doRelease(connection);
                return;
            }
            console.log(result);
            dialog.info('更改信息成功')
        });
    });


    function doRelease(connection, result) {
        connection.close(function(err) {
            if (err) { console.log(err.message); }
            res.redirect('/user/text')
        })
    }

})
module.exports = router;