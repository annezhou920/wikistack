'use strict';
var express = require('express');
var morgan = require('morgan');
var nunjucks = require('nunjucks');
var bodyParser = require('body-parser')
var models = require('./models');
var Page = models.Page;
var User = models.User;

var app = express();
var wikiRouter = require('./routes/wiki')
var usersRouter = require('./routes/users')

// app.get('/', function(req, res, next){
//   res.render('index')
// })

var env = nunjucks.configure('views', {noCache: true});
// have res.render work with html files
app.set('view engine', 'html');
// when res.render works with html files, have it use nunjucks to do so
app.engine('html', nunjucks.render);

app.use(morgan('dev'));

// body parsing middleware
app.use(bodyParser.urlencoded({ extended: false })); // for HTML form submits
app.use(bodyParser.json()); // would be for AJAX requests

app.use(express.static('public'));

// app.use('/', require('./routes'))
app.use('/wiki', wikiRouter);
app.use('/users', usersRouter);

//error handling middleware with err as parameter
app.use(function(err, req, res, next){
  console.error(err);
  res.status(500).send(err.message);
});

models.User.sync()
  .then(function () {
      return models.Page.sync()
  })
  .then(function () {
      app.listen(3000, function () {
          console.log('Server is listening on port 3000!');
      });
  })
  .catch(console.error);
