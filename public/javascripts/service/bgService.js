/**
 * Created by KCSTATION on 2017/6/11.
 */
"use strict";

var Q = require("q");
//mongodb lianjie
var mongodb = require('mongodb');
var mongodbServer = new mongodb.Server('ck.lchbl.com', 27017, { auto_reconnect: true, poolSize: 10 });
var db = new mongodb.Db('mdb', mongodbServer);

exports.haveCollect = function (tbName) {
    let deferred = Q.defer();
    db.collection(tbName, function(err, collection) {
        if (err){
            deferred.reject(err);
        }else{
            deferred.resolve(collection);
        }
    });
    return deferred.promise;
}
exports.haveCount = function (collection) {
    var deferred = Q.defer();
    collection.count({type:null},(err, data) => {
        if (err){
            deferred.reject(err);
        }else{
            deferred.resolve(data);
        }
    });
    return deferred.promise;
}