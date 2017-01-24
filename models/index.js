var Sequelize = require('sequelize');
var db = new Sequelize('postgres://localhost:5432/wikistack', {
    logging: false
});
// var marked = require('marked');

// .define is Sequelize method
// 'page' is first argument, second object is schema (what usually goes into db)
var Page = db.define('page', {
  title: {
    type: Sequelize.STRING,
    allowNull: false // no null can go into this field, this field is required
  },
  urlTitle: {
    type: Sequelize.STRING,
    allowNull: false
  },
  content: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  status: {
    type: Sequelize.ENUM('open', 'closed')
  },
  tags: {
    type: Sequelize.ARRAY(Sequelize.TEXT),
    // page.tags = 'blog, social media'
    set: function(value){

      var arrayOfTags;

      if (typeof value === 'string'){
        arrayOfTags = value.split(',').map(function(str){
          return str.trim();
        });
        // setDataValue is built into every instance
        this.setDataValue('tags', arrayOfTags);
      } else {
        this.setDataValue('tags',value);
      }
    }

  }
}, {
// optional configuration/third object for hooks, virtuals, class methods, instance methods
// virtual is when you want to add property to instance, access them like regular properties
// getter runs when you make a query, only consist of info from different attributes, like a virtual field
  getterMethods: {
      route: function() {
        return '/wiki/' + this.urlTitle;
      }
      // ,
      // everytime we want to access this.content, it will behind the scenes run the get function
      // and make expression of page.content equal to the return value of this
      // renderedContent: function(){
      //   return marked(this.content);
      // }
    },
     hooks: {
      // beforeValidate triggers right before instance. page is instance itself
      beforeValidate: function (page) {
        if (page.title) {
          // Removes all non-alphanumeric characters from title
          // And make whitespace underscore
          page.urlTitle = page.title.replace(/\s+/g, '_').replace(/\W/g, '');
        } else {
          // Generates random 5 letter string
          page.urlTitle = Math.random().toString(36).substring(2, 7);
        }
      }
    },
    // functions that get set on model itself and run in context of model
    classMethods: {
      findByTag: function(tag){
        // this query returns a promise
        return Page.findAll({
          where: {
            tags: {
              $overlap: [tag]
            }
          }
        });
      }
    },
    instanceMethods: {
        findSimilar: function(){
          return Page.findAll({
            where: {
              tags: {
                $overlap: this.tags
              },
              // finds similar tags but id is not same as the current one (basically filters out the page with same tags)
              id: {
                $ne: this.id
              }
            }
          })
        }
    }

  }
);




var User = db.define('user', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true // something that Sequelize is doing
    }
  }
});

// establish a connection that describes that a page has one user associated with it
// have methods on page that relate any user to a page
Page.belongsTo(User, {as: 'author'});

module.exports = {
  Page: Page,
  User: User
};
