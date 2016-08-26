var express = require('express');
var router = express.Router();
//var app = express();
/* GET home page. */
var bg = require('../public/javascripts/bg');/*提供数据*/

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/power', function(req, res) {
  res.render('power',{title:"最近文章", entries:bg.getBlogEntries()});
});
/**/
//var http = require('http');
router.get('/json/power/:id', function(req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(bg.getBlogEntry(req.params.id)));
});

//====================user
/*router.get('/user/name/:name/age/:age', function(req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  bg.saveUser(req.params.name,req.params.age,null)
  res.end("111");
});
router.get('/user/list', function(req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  bg.findUsersEnd(res);
});*/
//====================item
//pn 从1开始
router.get('/item/list/p/:pn', function(req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  bg.findItemsEnd(res,req.params.pn);
});
//obj_item###http://localhost:3000/item/batch/save?obj_items=[{"name":"91","img":"http://baidu.com/img"}]
router.post('/item/batch/save', function(req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  bg.batchSaveItm(req.body.obj_items);
  res.end('{}');
});
//=====url
router.get('/history/ref', function(req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  bg.batchRefineUrl(res,req.query.urls);
});
//============girl show url
router.get('/show', function(req, res, next) {
  bg.initShowPage(function(title,_obj){
    res.render(title, _obj);
  });
});
//页码生成器
router.get('/show/init', function(req, res) {
  bg.initShowPage(function(title,_obj){
    res.end(JSON.stringify(_obj));
  });
});



module.exports = router;
