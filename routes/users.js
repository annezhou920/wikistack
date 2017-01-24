'use strict';
var express = require('express');
var router = express.Router();
var models = require('../models');
var Promise = require('bluebird');
var Page = models.Page;
var User = models.User;
module.exports = router;

router.get('/', function(req, res, next){
  User.findAll()
      .then(function(users){
        res.render('users', { users: users })
      })
      .catch(next);
})

router.get('/:userId', function(req, res, next){

  var findingUserPages = Page.findAll({
      where: {
        authorId: req.params.userId
      }
  });
  var findingUser = User.findById(req.params.userId);

  // Promise.all can simultaneously make 2 db queries
  Promise.all([
    findingUserPages, findingUser
  ])
      .then(function(values){
          var pages = values[0];
          var user = values[1];

          user.pages = pages;

          res.render('userpage', {
              user: user,
          })
      })
      .catch(next);

})
