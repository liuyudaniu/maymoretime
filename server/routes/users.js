var express = require('express');
var router = express.Router();
var User = require("./../models/user")
require("./../util/util")
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//注册接口
router.get("/Register",function(req,res,next){
    var regName = req.param("regName"),
        regPwd = req.param("regPwd");
    User.findOne({userName:regName},function(err,doc){
      console.log("doc:"+doc);
        if(doc == null){
            var random = Math.floor((Math.random()*9+1)*1000000);
            let userInfo = {
                "userId":random,
                "userName":regName,
                "userPwd":regPwd
            };
            // res.send("ok")
            var user = new User(userInfo);
            return user.save(function(err1,doc1){
                if(err1){
                    res.json({
                        status:'1',
                        msg:err.message,
                        result:''
                    })
                }else{
                    if(doc1){
                        res.json({
                            status:"0",
                            msg:'',
                            result:''
                        });
                    }
                }
            });

        }else{
            if(doc){
                res.json({
                    status:'1',
                    msg:'用户名已经被注册',
                    result:''
                })
            }
        }
    })


})

//登录接口
router.post("/login",function (req,res,next) {
  // res.send("okooooooooooooooo")
  let params = {
    userName:req.body.userName,
    userPwd:req.body.userPwd
  }
  console.log(req.body.userName,req.body.userPwd);
  User.findOne(params, function (err,doc) {
    if(err){
      res.json({
        status:"1",
        msg:err.message
      });
    }else{
      if(doc){
        res.cookie("userId",doc.userId,{
          path:'/',
          maxAge:1000*60*60
        });
        res.cookie("userName",doc.userName,{
          path:'/',
          maxAge:1000*60*60
        });
        //req.session.user = doc;
        res.json({
          status:'0',
          msg:'',
          result:{
            userName:doc.userName
          }
        });
      }
    }
  });
});

//登出接口
router.post("/logout",(req,res,next)=>{
  res.cookie("userId","",{
    path:"/",
    maxAge:-1
  });
  res.cookie("userName","",{
    path:"/",
    maxAge:-1
  })
  res.json({
    status:"0",
    msg:'',
    result:''
  })
})

router.get("/checkLogin",function(req,res,next){
  if(req.cookies.userId){
    res.json({
      status:'0',
      msg:'',
      result:req.cookies.userName || ""
    })
  }else{
    res.json({
      status:'1',
      msg:'未登录',
      result:''
    })
  }
})

//取到购物车商品数量
router.get('/getCartCount',function(req,res,next){
  if(req.cookies && req.cookies.userId){
    var userId = req.cookies.userId;
    User.findOne({userId:userId},function(err,doc){
      if(err){
        res.json({
          status:'1',
          msg:err.message,
          result:''
        })
      }else{
        var cartList = doc.cartList;
        var cartCount = 0;
        cartList.map(item=>{
          cartCount += parseInt(item.productNum);
        })
        res.json({
          status:'0',
          msg:'',
          result:cartCount
        })
      }
    })
  }
})

//查询当前用户的购物车数据
router.get("/cartList",function(req,res,next){
    var userId = req.cookies.userId;
    User.findOne({userId:userId},function(err,doc){
      if(err){
        res.json({
          status:'1',
          msg:err.message,
          result:''
        })
      }else{
        if(doc){
          res.json({
            status:"0",
            msg:'',
            result:doc.cartList
          });
        }
      }
    })
})

//购物车删除
router.post('/cartDel',function(req,res,next){
  var userId = req.cookies.userId,productId = req.body.productId;
  User.update({userId:userId},{$pull:{'cartList':{'productId':productId}}},function(err,doc){
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else{
      res.json({
        status:"0",
        msg:'',
        result:'suc'
      });
    }
  })
})

//修改商品数量
router.post("/cartEdit", function (req,res,next) {
  var userId = req.cookies.userId,
    productId = req.body.productId,
    productNum = req.body.productNum,
    checked = req.body.checked;
  User.update({"userId":userId,"cartList.productId":productId},{
    "cartList.$.productNum":productNum,
    "cartList.$.checked":checked
  }, function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else{
      res.json({
        status:"0",
        msg:'',
        result:'suc'
      });
    }
  })
});

//购物车全选
router.post("/editCheckAll",function(req,res,next){
  var userId = req.cookies.userId,
      checkAll = req.body.checkAll?'1':'0';
  User.findOne({userId:userId},function(err,user){
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{
      if(user){
        user.cartList.forEach(item=>{
          item.checked = checkAll
        })
        user.save(function(err1,doc){
          if(err1){
            res.json({
              status:'1',
              msg:err1.message,
              result:''
            });
          }else{
            res.json({
              status:'0',
              msg:'',
              result:'suc'
            });
          }
        })
      }
    }
  })
})

//查询用户地址接口
router.get("/addressList",function (req,res,next) {
  var userId = req.cookies.userId;
  User.findOne({userId:userId},function(err,doc){
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else{
      res.json({
        status:"0",
        msg:'',
        result:doc.addressList
      });
    }
  })
})

//设置默认地址
router.post("/setDefault", function (req,res,next) {
  var userId = req.cookies.userId,
    addressId = req.body.addressId;
  if(!addressId){
    res.json({
      status:'1003',
      msg:'addressId is null',
      result:''
    });
  }else{
    User.findOne({userId:userId}, function (err,doc) {
      if(err){
        res.json({
          status:'1',
          msg:err.message,
          result:''
        });
      }else{
        var addressList = doc.addressList;
        addressList.forEach((item)=>{
          if(item.addressId ==addressId){
            item.isDefault = true;
          }else{
            item.isDefault = false;
          }
        });

        doc.save(function (err1,doc1) {
          if(err){
            res.json({
              status:'1',
              msg:err.message,
              result:''
            });
          }else{
            res.json({
              status:'0',
              msg:'',
              result:''
            });
          }
        })
      }
    });
  }
});

//添加地址接口
router.post("/addNewAddress",function(req,res,next){
  var random = Math.floor((Math.random()*9+1)*100000),
      userId = req.cookies.userId;
  console.log(userId)
  let info = {
      addressId:random,
      userName:req.body.userName,
      streetName:req.body.streetName,
      postCode:req.body.postCode,
      tel:req.body.tel
  }
  User.findOne({userId:userId},function(err,userInfo){
      if(err){
          res.json({
              status:'1',
              msg:err.message,
              result:''
          });
      }else{
          userInfo.addressList.push(info);
          console.log(userInfo)
          userInfo.save(function(err1){
              if(err1){
                  res.json({
                      status:'1',
                      msg:err.message,
                      result:''
                  });
              }else{
                  res.json({
                      status:'0',
                      msg:'',
                      result:'suc'
                  });
              }
          })
      }
  })
})


//删除地址接口
router.post("/delAddress", function (req,res,next) {
  var userId = req.cookies.userId,addressId = req.body.addressId;
  User.update({
    userId:userId
  },{
    $pull:{
      'addressList':{
        'addressId':addressId
      }
    }
  }, function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{
      res.json({
        status:'0',
        msg:'',
        result:''
      });
    }
  });
});

//请求生成订单
router.post('/payMent',function(req,res,next){
  var userId = req.cookies.userId,
      orderTotal = req.body.orderTotal,
      addressId = req.body.addressId
  User.findOne({userId:userId},function(err,doc){
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{
      var address = '',
          goodsList=[];
      doc.addressList.forEach(item=>{
        if(addressId == item.addressId){
          address = item;
        }
        doc.cartList.filter(item=>{
          if(item.checked == '1'){
            goodsList.push(item);
          }
        })
      });
      var platForm = '622';
      var r1 = Math.floor(Math.random()*10);
      var r2 = Math.floor(Math.random()*10);
      var sysDate = new Date().Format('yyyyMMddhhmmss');
      var createDate = new Date().Format('yyy-MM-dd hh:mm:ss')
      var orderId =platForm + r1 +sysDate + r2;
      var order = {
        orderId:orderId,
        orderTotal:orderTotal,
        goodsList:goodsList,
        orderStatus:'1',
        createDate:createDate
      };
      doc.orderList.push(order);
      doc.save(function(err1,doc1){
        if(err1){
          res.json({
            status:'1',
            msg:err1.message,
            result:''
          });
        }else{
          res.json({
            status:'0',
            msg:'',
            result:{
              orderId:order.orderId,
              orderTotal:order.orderTotal
            }
          });
        }
      })

    }
  })
})

//根据订单Id查询订单信息
router.get("/orderDetail", function (req,res,next) {
  var userId = req.cookies.userId,orderId = req.param("orderId");
  User.findOne({userId:userId}, function (err,userInfo) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{
      var orderList = userInfo.orderList;
      if(orderList.length>0){
        var orderTotal = 0;
        orderList.forEach((item)=>{
          if(item.orderId == orderId){
            orderTotal = item.orderTotal;
          }
        });
        if(orderTotal>0){
          res.json({
            status:'0',
            msg:'',
            result:{
              orderId:orderId,
              orderTotal:orderTotal
            }
          })
        }else{
          res.json({
            status:'120002',
            msg:'无此订单',
            result:''
          });
        }
      }else{
        res.json({
          status:'120001',
          msg:'当前用户未创建订单',
          result:''
        });
      }
    }
  })
});
module.exports = router;
