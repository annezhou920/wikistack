'use strict';
var express = require('express');
var router = express.Router();
var models = require('../models');
var Page = models.Page;
var User = models.User;

module.exports = router;

// GET /wiki
router.get('/', function(req, res, next) {
  Page.findAll({})
      .then(function(pages){
        res.render('index', { pages: pages })
      })
      .catch(next);
});

// POST /wiki
router.post('/', function(req, res, next) {

  //access db and return a promise, find or create user with email and name from request in form
  User.findOrCreate({
    where: {
      email: req.body.authorEmail,
      name: req.body.authorName
    }
  })
    // findOrCreate creates 2 values, use spread when expecting multiple values in array back
      .spread(function(user, wasCreatedBoolean){ // [pageThatWasFoundOrCreated, createdBoolean]

          // take remainder of req.body that we haven't used to create new name in db
          return Page.create({
            title: req.body.title,
            content: req.body.content,
            status: req.body.status,
            tags: req.body.tags
          }).then(function(createdPage){  // use .then to receive created page
            // calls relationship method on belongsTo
            // this is asynchronous, updating the db
            return createdPage.setAuthor(user);
          });
      })
      .then(function(createdPage){
        res.redirect(createdPage.route);
      })
      .catch(next);

  // var page = Page.build(req.body);
  // .create is asynchronous cause you're accessing database (going to read and write)
  // .build is synchronous (does not go to kernel)

  // page is an instance but not saved in db
  // var page = Page.build({
  //   title: req.body.title,
  //   content: req.body.content
  // });
  //
  // // created page and saved to database, then redirected to page via route virtual
  // // make sure we only redirect *after* our save is complete!
  // // note: `.save` is asynchronous and returns a promise or it can take a callback.
  // page.save()
  //     // .then(page => res.json(page))
  //     .then(function(savedPage){
  //         res.redirect(savedPage.route); // route virtual FTW
  //       })
  //     .catch(next);

});

// GET /wiki/add
router.get('/add', function(req, res, next) {
  res.render('addpage');
});

router.get('/search/:tag', function(req, res, next){
  Page.findByTag(req.params.tag)
      .then(function(pages){
          res.render('index', {
            pages: pages
          })
      })
      .catch(next);
});

router.get('/:urlTitle', function (req, res, next) {
  Page.findOne({
    where: {
      urlTitle: req.params.urlTitle
    }
  })
    .then(function(page){
      if(page === null) {
        return next(new Error('That page was not found!'));
      }

      return page.getAuthor()
            .then(function(author){
              page.author = author;

              res.render('wikipage', { page: page })
            });
      // else {
      //   res.render('wikipage', { page: page } );
      // }

    })
    .catch(next);
});

router.get('/:urlTitle/similar', function(req, res, next){
  Page.findOne({
    where: {
      urlTitle: req.params.urlTitle
    }
  })
      .then(function(page){
          if(page === null) {
            return next(new Error('That page was not found!'));
          }
          //invokes findSimilar function from Page instance and returns promise
          return page.findSimilar();
      })
      .then(function(similarPages){
          res.render('index', {
            pages: similarPages
          })
      })
      .catch(next);

});
