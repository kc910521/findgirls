// import * as uts from "./utils/utils"
// import * as bgser from "./service/bgService"

/**
 * Created by robu on 2016/8/15.
 */

"use strict";
var uts = require("./utils/utils")
var bgser = require("./service/bgService")

var entries = [
    {"id":1, "title":"��һƪ", "body":"����", "published":"6/2/2013"},
    {"id":2, "title":"�ڶ�ƪ", "body":"����", "published":"6/3/2013"},
    {"id":3, "title":"����ƪ", "body":"����", "published":"6/4/2013"},
    {"id":4, "title":"����ƪ", "body":"����", "published":"6/5/2013"},
    {"id":5, "title":"����ƪ", "body":"����", "published":"6/10/2013"},
    {"id":6, "title":"����ƪ", "body":"����", "published":"6/12/2013"}
];
//==============TABLE_NAME================
var tb_user = "foo";//�û���name
var tb_item = "itm";//��Ŀ��
var tb_history = "his";//liurl captured history
var tb_user_favor = "favor";
var tb_favor_count = "favor_count";
//promise
var Q = require("q");
//mongodb lianjie
var mongodb = require('mongodb');
var mongodbServer = new mongodb.Server('ck.lchbl.com', 27017, { auto_reconnect: true, poolSize: 10 });
var db = new mongodb.Db('mdb', mongodbServer);
var objectId = mongodb.ObjectID;
/* open db */
//=======================item============
//var pageNum = 20;//show @pageNum itms per page
//----------------relase limit
const EventEmitter  =  require('events').EventEmitter;
var emitter = new EventEmitter();
emitter.setMaxListeners(100);




exports.findItemsEnd = function(res,page,pageNum,itmType){
    let pn = 20;
    if (pageNum != undefined){
        pn = parseInt(pageNum);//show @pageNum itms per page
    }
    let parObj = null;
    if (itmType == undefined || itmType == 'null'){
        parObj = {type:null};//show @pageNum itms per page
    }else{
        parObj = {type:parseInt(itmType)};
    }
    page = page < 1?1:page;
    db.open(() => {
        db.collection(tb_item, (err, collection) => {
            if(err) throw err;
            else {
                collection.find(parObj).limit(pn).skip(pn*(page-1)).toArray((err, docs) => {
                    if (err) throw  err;
                    db.close();
                    res.charset = 'GBK';
                    console.log("parObj:"+JSON.stringify(parObj));
                    res.end(JSON.stringify(docs));
                });
            }
        });
    });
}
//itmInfs: [name][url] list
/**
 * 批量保存图片条目
 * @param itmInfsStr
 */
exports.batchSaveItm = function(itmInfsStr){
    if (itmInfsStr){
        let itmInfs = JSON.parse(itmInfsStr);
        let isVld = true;
        for (var itm of itmInfs){
            if (itm['name'] == undefined || itm['img'] == undefined){
                isVld = false;
                break;
            }
        }
        if (isVld){
            db.open(() => {
                db.collection(tb_item, (err, collection) => {
                    collection.insertMany(itmInfs, (err, data) => {
                        if (data) {
                            console.log('Successfully Insert');
                        } else {
                            console.log('Failed to Insert');
                        }
                        db.close();
                    });
                });
            });
        }else{
            console.log('data error: Failed to Insert');
            console.dir(itmInfs);
        }
    }else{
        console.log('batchSaveItm Failed to Insert');
    }
}


exports.initShowPage = function(ppn,endCallBack) {
    console.log("wtf:"+ppn);
    if (ppn == undefined){
        ppn = 20;
    }
    db.open(() => {
        bgser.haveCollect(tb_item).then(bgser.haveCount).done((data) => {
            var adArr = null;
            if (data) {
                adArr = uts.takePageArrs(data,ppn);
                console.log("data:"+data+",arr:"+adArr);
            } else {
                console.log("no data");
            }
            db.close();
            endCallBack("girlShow",{title: 'GIRL SHOW',imgNumber:data,'pgArray':adArr});
        },(err) => {
            console.log(err);
            db.close();
        });
    });
}
//将favorIds设置到喜爱的表中
exports.favorItem = function(favorIdsStr,userId){
    if (favorIdsStr != undefined && userId != undefined){
        let favorIds = JSON.parse(favorIdsStr);
        if (!favorIds){
            return;
        }
        db.open(() => {
            db.collection(tb_user_favor, (err, collection) => {
                var uFavs = [];
                var tss = Date.parse(new Date());
                for (var itm of favorIds){
                    uFavs.push({//User.findOne({_id:ObjectID(id)},function(err,doc){…
                        relImg : objectId(itm),
                        userToken : userId,
                        updateTm : tss
                    });
                }
                //refine uFavs
                //----
                collection.insertMany(uFavs, (err, data) => {
                    if (data) {
                        console.log('Successfully Insert fav:'+data);
                    } else {
                        console.log('Failed to Insert');
                    }
                    db.close();
                });
            });
        });
    }else{
        console.log('favorItem params undefined.');
    }
}
/**
 * 受欢迎图片设置,保存受欢迎图片id，重复则计数+1
 * @param favorIdsStr
 * @param userId
 */
exports.favorItemCount = function(favorIdsStr){
    if (favorIdsStr != undefined){
        let favorIds = JSON.parse(favorIdsStr);
        if (!favorIds){
            return;
        }
        let idObjects = [];
        for (var itm of favorIds){
            idObjects.push(objectId(itm));
        }
        db.open(function() {
            db.collection(tb_favor_count, function(err, collection) {
                var uFavs = [];
                for (var idx = 0;idx < favorIds.length; idx ++){
                    uFavs.push({//User.findOne({_id:ObjectID(id)},function(err,doc){…
                        relImg : objectId(favorIds[idx]),
                        fvCount : 1
                    });
                }
                collection.find({relImg:{$in:idObjects}}).toArray(function(err,docs){
                    if (err) throw  err;
                    if (docs != null && docs.length >0){
                        for (var doc of docs){
                            for (var i2dx = uFavs.length-1;i2dx >= 0;i2dx --){
                                if (uFavs[i2dx].relImg.toString() ==doc.relImg.toString()){
                                    uFavs.splice(i2dx,1);
                                    collection.update({relImg:doc.relImg},{$set:{fvCount:doc.fvCount+1}});
                                }
                            }
                        }
                    }
                    console.log(uFavs);
                    if (uFavs == null || uFavs.length < 1){
                        console.log("无需要数据直接插入");
                        db.close();
                    }else{
                        collection.insertMany(uFavs, function(err, data) {
                            if (data) {
                                console.log('Successfully Insert fav:' + data);
                            } else {
                                console.log('Failed to Insert:'+err);
                            }
                            db.close();
                        });
                    }
                });
            });
        });
    }else{
        console.log('favorItem params undefined.');
    }
}
/**
 * 得到排名最高的图片
 * @param res
 * @param page
 */
exports.findMostPop = function(res){
    db.open(() => {
        //先查计数表
        db.collection(tb_favor_count,(err2, fc_coll) => {
            if(err2) throw err2;
            fc_coll.find({}).sort({"fvCount":-1}).limit(30).skip(0).toArray(function (err, docs){
                var iArr = uts.pickToArray(docs,"relImg");
                res.charset = 'GBK';
                if (iArr != null){
                    //再查条目主表
                    db.collection(tb_item, (err, collection) => {
                        if(err) throw err;
                        else {
                            collection.find({_id:{$in:iArr}}).toArray(function(err4, docs2){
                                if(err4) throw err4;
                                res.end(JSON.stringify(uts.packImgItm(docs2,docs)));
                                db.close();
                            });
                        }
                    });
                }else{
                    res.end("{}");
                    db.close();
                }
            });
        });
/*                collection.find({}).limit(30).skip(0).toArray(function (err, docs) {
                    if (err) throw  err;
                    db.close();
                    res.charset = 'GBK';
                    console.log(JSON.stringify(docs));
                    res.end(JSON.stringify(docs));
                });
                */
    });
}

//li_url is post url,not img
/*
* return
* [
 {
 "li_url": "http://www.xxx.com",
 "_id": "57bad7efe940902f40f96a0a"
 },
 {
 "li_url": "http://www.1xxx.com",
 "_id": "57bad7efe940902f40f96a0b"
 }
 ]
 批量将传入的url数组和现有数据库做比对，去除已存过的
*
* */
exports.batchRefineUrl = function(res,urlsStr){
    db.open(() => {
        db.collection(tb_history, (err, collection) => {
            let urls = JSON.parse(urlsStr);
            collection.find({li_url:{$in:urls}}).toArray((err,docs) => {
                if(err) throw  err;
                else{
                    console.log(docs);
                    let lstArr = uts.arr1Analysis(urls,docs);
                    let aJArr = [];
                    if (lstArr == null){
                        for (var itm of urls){
                            aJArr.push({li_url : itm + ''});
                        }
                    }else{
                        for (var itm of lstArr){
                            aJArr.push({li_url : itm+''});
                        }
                    }
                    if (aJArr && aJArr.length > 0){
                        collection.insertMany(aJArr, (err, data) => {
                            if(err) throw  err;
                            db.close();
                            if (aJArr) {
                                res.end(JSON.stringify(aJArr));
                                console.log('URL Successfully Insert');
                            }else {
                                res.end("{}");
                                console.log('URL Failed to Insert');
                            }
                        });
                    }else{
                        db.close();
                        res.end("{}");
                        console.log('no url needed insert');
                    }
                }
            });
        });
    });
}
//=======================user============
exports.saveUser = function(name,age,sex){
    db.open(() => {
        db.collection(tb_user, (err, collection) => {
            collection.insertMany([{
                    name: name+'',
                    age: age,
                    sex: 1+''
                }
            ], (err, data) => {
                if (data) {
                    console.log('Successfully Insert');
                } else {
                    console.log('Failed to Insert');
                }
                db.close();
            });
        });
    });
}

exports.findUsersEnd = function(res){
    db.open(() => {
        db.collection(tb_user, (err, collection) => {
            if(err) throw err;
            else {
                collection.find({}).toArray((err, docs) => {
                    if (err) throw  err;
                    else {
                        console.log(docs);
                        db.close();
                    }
                    res.end(JSON.stringify(docs));
                });
            }
/*            collection.find(function (err, data) {
             if (err) return console.error(err);
             console.log(data);
             if (data) {
             console.log(data.length);
             for (var idx = 0; idx < data.length; idx++) {
             console.log('Name: ' + data[idx].name + ', age: ' + data[idx].age);
             }

             } else {
             console.log('Cannot found');
             }
             db.close();
             });*/
        });
    });
}
