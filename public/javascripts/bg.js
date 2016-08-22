/**
 * Created by robu on 2016/8/15.
 */
var entries = [
    {"id":1, "title":"��һƪ", "body":"����", "published":"6/2/2013"},
    {"id":2, "title":"�ڶ�ƪ", "body":"����", "published":"6/3/2013"},
    {"id":3, "title":"����ƪ", "body":"����", "published":"6/4/2013"},
    {"id":4, "title":"����ƪ", "body":"����", "published":"6/5/2013"},
    {"id":5, "title":"����ƪ", "body":"����", "published":"6/10/2013"},
    {"id":6, "title":"����ƪ", "body":"����", "published":"6/12/2013"}
];

var tb_user = "foo";//�û���name
var tb_item = "itm";//��Ŀ��
var tb_history = "his";//liurl captured history
//mongodb lianjie
var mongodb = require('mongodb');
var mongodbServer = new mongodb.Server('localhost', 27017, { auto_reconnect: true, poolSize: 10 });
var db = new mongodb.Db('mdb', mongodbServer);
/* open db */
//=======================item============
var pageNum = 20;//show @pageNum itms per page

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

exports.getBlogEntries = function (){
    return entries;
}


exports.getBlogEntry = function (id){
    for(var i=0; i < entries.length; i++){
        if(entries[i].id == id) return entries[i];
    }
}