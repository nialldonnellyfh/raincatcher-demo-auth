'use strict';

//TODO - Really should be in the raincatcher-user module
const IDENTITY = 'user';
const CLOUD_PREFIX = 'cloud';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


//TODO - Move this somewhere else
function generateTopic(topic) {
  return 'wfm:' + CLOUD_PREFIX + ':' + IDENTITY + ":" + topic;
}


module.exports = function initialiseUserStore(applicationStore) {

  //TODO Validation, custom indexes, schema refs etc.
  var userSchema = new Schema({
    "id" : {
      type: Schema.Types.Number,
      required: true,
      index: true
    },
    "username" : {
      type: Schema.Types.String,
      required: true
    },
    "name" : {
      type: Schema.Types.String,
      required: true
    },
    "position" : {
      type: Schema.Types.String,
      required: true
    },
    "phone" : {
      type: Schema.Types.String,
      required: true
    },
    "email" : {
      type: Schema.Types.String,
      required: true
    },
    "notes" : {
      type: Schema.Types.String,
      required: true
    },
    "avatar" : {
      type: Schema.Types.String,
      required: true
    },
    "banner" : {
      type: Schema.Types.String,
      required: true
    }
  });

  //Registering the "User" schema with the data store for mongoose.
  //TODO: Should move to different file.
  applicationStore.initDataSet('mymongoose', {
    schemaId: IDENTITY,
    userSchema: userSchema
  });


  //User-specific mediator topics that are registered

  //TODO Mongoose Optimisation (lean, limits etc)
  applicationStore.registerSubscriber('mymongoose', IDENTITY, generateTopic('create'), function(userToCreate) {
    return this.model.create(userToCreate);
  });

  //TODO Pagination, lean etc for performance.
  applicationStore.registerSubscriber('mymongoose', IDENTITY, generateTopic('list'), function() {
    return this.model.find();
  });

  applicationStore.registerSubscriber('mymongoose', IDENTITY, generateTopic('search'), function(searchCriteria) {
    //TODO - Generate search criteria / reference mongoose format etc.
    return this.model.find(searchCriteria);
  });

  applicationStore.registerSubscriber('mymongoose', IDENTITY, generateTopic('delete'), function(userId) {
    return this.model.remove(userId);
  });


  //TODO error handling etc.
  applicationStore.registerSubscriber('mymongoose', IDENTITY, generateTopic('update'), function(userToUpdate) {
    //TODO probably could be a wfm:user:read topic if the developer wanted. (e.g. if the user was cached in redis)
    return this.model.findById(userToUpdate.id).then(function(user){
      _.extend(user, userToUpdate);
      user.save();
    });
  });
};


//module.exports = function(mediator) {
//  var topicList = 'wfm:user:list';
//  console.log('Subscribing to mediator topic:', topicList);
//  mediator.subscribe(topicList, function() {
//    setTimeout(function() {
//      mediator.publish('done:' + topicList, users);
//    }, 0);
//  });
//
//  var topicLoad = 'wfm:user:read';
//  console.log('Subscribing to mediator topic:', topicLoad);
//  mediator.subscribe(topicLoad, function(id) {
//    setTimeout(function() {
//      var user = _.find(users, function(_user) {
//        return _user.id === id;
//      });
//      if (user) {
//        mediator.publish('done:' + topicLoad + ':' + id, user);
//      } else {
//        mediator.publish('error:' + topicLoad + ':' + id, 'No such user');
//      }
//    }, 0);
//  });
//
//  var topicUsernameLoad = 'wfm:user:username:read';
//  console.log('Subscribing to mediator topic:', topicUsernameLoad);
//  mediator.subscribe(topicUsernameLoad, function(username) {
//    setTimeout(function() {
//      var user = _.find(users, function(_user) {
//        return _user.username === username;
//      });
//      if (user) {
//        mediator.publish('done:' + topicUsernameLoad + ':' + username, user);
//      } else {
//        mediator.publish('error:' + topicUsernameLoad + ':' + username, 'No such user');
//      }
//    }, 0);
//  });
//
//  var topicSave = 'wfm:user:update';
//  console.log('Subscribing to mediator topic:', topicSave);
//  mediator.subscribe(topicSave, function(user) {
//    setTimeout(function() {
//      var index = _.findIndex(users, function(_user) {
//        return _user.id === user.id;
//      });
//      users[index] = user;
//      console.log('Saved user:', user);
//      mediator.publish('done:' + topicSave + ':' + user.id, user);
//    }, 0);
//  });
//
//  var topicCreate = 'wfm:user:create';
//  console.log('Subscribing to mediator topic:', topicCreate);
//  mediator.subscribe(topicCreate, function(user) {
//    setTimeout(function() {
//      user.id = shortid.generate();
//      users.push(user);
//      console.log('Created user:', user);
//      mediator.publish('done:' + topicCreate + ':' + user.createdTs, user);
//    }, 0);
//  });
//
//  var topicDelete = 'wfm:user:delete';
//  console.log('Subscribing to mediator topic:', topicSave);
//  mediator.subscribe(topicDelete, function(user) {
//    setTimeout(function() {
//      var removals = _.remove(users, function(_object) {
//        return user.id === _object.id;
//      });
//      var removed = removals.length ? removals[0] : null;
//      if (removed && removed.id) {
//        console.log('Deleted user:', removed);
//        mediator.publish('done:' + topicDelete + ':' + removed.id, user);
//      } else {
//        mediator.publish('error:' + topicDelete + ':' + user.id, user);
//      }
//    }, 0);
//  });
//
//};
