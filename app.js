//no crash
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
});

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');



var app = express();


/*app.use("/",function(request, response) {
 response.writeHead(200, { "Content-Type": "text/plain" });
 response.end("Hello world!\n");
 });*/
var hbs = require('hbs');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
//app.set('view engine', 'jade');
app.engine('html', hbs.__express);
//app.use(express.bodyParser());
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var routes = require('./routes/index');
var users = require('./routes/users');
app.use('/', routes);
app.use('/users', users);
app.use(function(request, response, next) {
  console.log("In comes a " + request.method + " to " + request.url);
  next();
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers



// production error handler



module.exports = app;
