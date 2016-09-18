/**
 * Created by robu on 2016/8/15.
 */
"use strict";
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
//mongodb lianjie
var mongodb = require('mongodb');
var mongodbServer = new mongodb.Server('localhost', 27017, { auto_reconnect: true, poolSize: 10 });
var db = new mongodb.Db('mdb', mongodbServer);
var objectId = mongodb.ObjectID;
/* open db */
//=======================item============
var pageNum = 20;//show @pageNum itms per page
//----------------relase limit
const EventEmitter  =  require('events').EventEmitter;
var emitter = new EventEmitter();
emitter.setMaxListeners(100);


exports.findItemsEnd = function(res,page){
    page = page < 1?1:page;
    db.open(function() {
        db.collection(tb_item, function(err, collection) {
            if(err) throw err;
            else {
                collection.find({}).limit(pageNum).skip(pageNum*(page-1)).toArray(function (err, docs) {
                    if (err) throw  err;
                    db.close();
                    res.charset = 'GBK';
                    console.log(JSON.stringify(docs));
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
        var itmInfs = JSON.parse(itmInfsStr);
        var isVld = true;
        for (var idx = 0;idx < itmInfs.length; idx ++){
            if (itmInfs[idx]['name'] == undefined || itmInfs[idx]['img'] == undefined){
                isVld = false;
                break;
            }
        }
        if (isVld){
            db.open(function() {
                db.collection(tb_item, function(err, collection) {
                    collection.insertMany(itmInfs, function(err, data) {
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


exports.initShowPage = function(endCallBack){
    db.open(function() {
        db.collection(tb_item, function(err, collection) {
            collection.count(function(err, data) {
                var adArr = null;
                if (data) {

                    adArr = takePageArrs(data);
                    console.log("data:"+data+",arr:"+adArr);
                } else {
                    console.log("no data");
                }
                db.close();
                endCallBack("girlShow",{title: 'GIRL SHOW',imgNumber:data,'pgArray':adArr});
            });
        });
    });
}
//将favorIds设置到喜爱的表中
exports.favorItem = function(favorIdsStr,userId){
    if (favorIdsStr != undefined && userId != undefined){
        var favorIds = JSON.parse(favorIdsStr);
        if (!favorIds){
            return;
        }
        db.open(function() {
            db.collection(tb_user_favor, function(err, collection) {
                var uFavs = [];
                var tss = Date.parse(new Date());
                for (var idx = 0;idx < favorIds.length; idx ++){
                    uFavs.push({//User.findOne({_id:ObjectID(id)},function(err,doc){…
                        relImg : objectId(favorIds[idx]),
                        userToken : userId,
                        updateTm : tss
                    });
                }
                //refine uFavs
                //----
                collection.insertMany(uFavs, function(err, data) {
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
        var favorIds = JSON.parse(favorIdsStr);
        if (!favorIds){
            return;
        }
        var idObjects = [];
        for (var idx = 0; idx < favorIds.length; idx ++){
            idObjects.push(objectId(favorIds[idx]));
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
                        for (var idx = 0;idx < docs.length; idx ++){
                            for (var i2dx = uFavs.length-1;i2dx >= 0;i2dx --){
                                if (uFavs[i2dx].relImg.toString() == docs[idx].relImg.toString()){
                                    uFavs.splice(i2dx,1);
                                    collection.update({relImg:docs[idx].relImg},{$set:{fvCount:docs[idx].fvCount+1}});
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
    db.open(function() {
        //先查计数表
        db.collection(tb_favor_count,function(err2, fc_coll){
            if(err2) throw err2;
            fc_coll.find({}).sort({"fvCount":-1}).limit(30).skip(0).toArray(function (err, docs){
                var iArr = pickToArray(docs,"relImg");
                res.charset = 'GBK';
                if (iArr != null){
                    //再查条目主表
                    db.collection(tb_item, function(err, collection) {
                        if(err) throw err;
                        else {
                            collection.find({_id:{$in:iArr}}).toArray(function(err4, docs2){
                                if(err4) throw err4;
                                res.end(JSON.stringify(packImgItm(docs2,docs)));
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
    db.open(function() {
        db.collection(tb_history, function(err, collection) {
            var urls = JSON.parse(urlsStr);
            collection.find({li_url:{$in:urls}}).toArray(function(err,docs){
                if(err) throw  err;
                else{
                    console.log(docs);
                    var lstArr = arr1Analysis(urls,docs);
                    var aJArr = [];
                    if (lstArr == null){
                        for (var idx  =0; idx < urls.length; idx ++){
                            aJArr.push({li_url : urls[idx]+''});
                        }
                    }else{
                        for (var idx  =0; idx < lstArr.length; idx ++){
                            aJArr.push({li_url : lstArr[idx]+''});
                        }
                    }
                    if (aJArr && aJArr.length > 0){
                        collection.insertMany(aJArr, function(err, data) {
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
    db.open(function() {
        db.collection(tb_user, function(err, collection) {
            collection.insertMany([{
                    name: name+'',
                    age: age,
                    sex: 1+''
                }
            ], function(err, data) {
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
    db.open(function() {
        db.collection(tb_user, function(err, collection) {
            if(err) throw err;
            else {
                collection.find({}).toArray(function (err, docs) {
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
function packImgItm(imgArr,hotArr){
    if (imgArr == undefined || hotArr == undefined){
        return null;
    }else{
        for (var idx1 = 0;idx1 < imgArr.length;idx1 ++){
            for (var idx2 = 0;idx2 < hotArr.length; idx2 ++){
                if (hotArr[idx2].relImg.toString() == imgArr[idx1]._id.toString()){
                    imgArr[idx1].hot = hotArr[idx2].fvCount;
                    break;
                }
                if (idx2 == hotArr.length-1 && imgArr[idx1].hot == undefined){
                    imgArr[idx1].hot = 1;
                }
            }
        }
        return imgArr;
    }
}


//将目标数组转为指定属性的数组
function pickToArray(obj,attr){
    var tpArr = [];
    if (obj == undefined){
        return null;
    }
    for (var idx = 0; idx < obj.length; idx ++){
        tpArr.push(obj[idx][attr+""]);
    }
    return tpArr;
}
//得到orgArr不存在于arr2的所有元素
function arr1Analysis(orgArr,arr2){
    if (orgArr == undefined || arr2 == undefined || orgArr.length <= 0 || arr2.length <= 0){
        return null;
    }
    var resArr = [];
    for (var idx = 0; idx < orgArr.length ;idx ++){
        if (!contains(arr2,orgArr[idx],"li_url")){
            resArr.push(orgArr[idx]);
        }
    }
    return resArr;
}
function contains(a, obj,objParam) {
    var i = a.length;
    while (i--) {
        if (objParam){
            if (a[i][objParam] === obj) {
                return true;
            }
        }else{
            if (a[i] === obj) {
                return true;
            }
        }
    }
    return false;
}

/**
 * 得到随机页码
 * @param totalQty
 * @returns {*}
 */
function takePageArrs(totalQty){
    let lastPn = Math.ceil(totalQty/pageNum);
    let maxShow = lastPn>99?99:lastPn;
    //var pgArrs = [];
    let vTmpIdx = null;
    let vTemplate = [];
    if (maxShow.length == 0){
        return [1];
    }
    for (let idx = 1;idx <= maxShow;idx ++){
        vTemplate.push(idx);
    }
    for (let idx = 0;idx < (maxShow/3)+1;idx ++){
        vTmpIdx = Math.floor(Math.random()*maxShow);
        var tmpVal = vTemplate[idx];
        vTemplate[idx] = vTemplate[vTmpIdx];
        vTemplate[vTmpIdx] = tmpVal;
    }
    /*
     暂时废弃====开始实行替换法造随机
     for (var idx = 0;idx < maxShow/3;idx ++){
     vTmp = (Math.random()*maxShow)+1;
     if (contains(pgArrs,vTmp)){
     idx --;
     }else{
     pgArrs.push(vTmp);
     vTemplate.splice(vTmp-1,1);
     }
     }*/
    return vTemplate;
}
/*
exports.getBlogEntries = function (){
    return entries;
}


exports.getBlogEntry = function (id){
    for(var i=0; i < entries.length; i++){
        if(entries[i].id == id) return entries[i];
    }
}*/
