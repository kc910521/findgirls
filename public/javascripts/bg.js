/**
 * Created by robu on 2016/8/15.
 */
var entries = [
    {"id":1, "title":"第一篇", "body":"正文", "published":"6/2/2013"},
    {"id":2, "title":"第二篇", "body":"正文", "published":"6/3/2013"},
    {"id":3, "title":"第三篇", "body":"正文", "published":"6/4/2013"},
    {"id":4, "title":"第四篇", "body":"正文", "published":"6/5/2013"},
    {"id":5, "title":"第五篇", "body":"正文", "published":"6/10/2013"},
    {"id":6, "title":"第六篇", "body":"正文", "published":"6/12/2013"}
];

var tb_user = "foo";//用户表name
var tb_item = "itm";//条目表
//mongodb lianjie
var mongodb = require('mongodb');
var mongodbServer = new mongodb.Server('localhost', 27017, { auto_reconnect: true, poolSize: 10 });
var db = new mongodb.Db('mdb', mongodbServer);
/* open db */
//=======================item============
var pageNum = 20;//show @pageNum itms per page

exports.findItemsEnd = function(res,page){
    db.open(function() {
        db.collection(tb_item, function(err, collection) {
            if(err) throw err;
            else {
                collection.find({}).limit(pageNum).skip(pageNum*(page-1)).toArray(function (err, docs) {
                    if (err) throw  err;
                    else {
                        console.log(docs);
                        db.close();
                    }
                    res.end(JSON.stringify(docs));
                });
            }
        });
    });
}
//=======================user============
exports.saveUser = function(name,age,sex){
    db.open(function() {
        db.collection(tb_user, function(err, collection) {
            collection.insert({
                name: name+'',
                age: age,
                sex: 1+''
            }, function(err, data) {
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