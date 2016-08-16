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
router.post('/user/name/:name/age/:age', function(req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(bg.saveUser(req.params.name,req.params.age,null)));
});
router.get('/user/list', function(req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  bg.findUsersEnd(res);
});
//====================item
router.get('/item/list/p/:pn', function(req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  bg.findItemsEnd(res,req.params.pn);
});
module.exports = router;
