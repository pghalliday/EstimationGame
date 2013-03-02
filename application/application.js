Items = new Meteor.Collection('items');

if (Meteor.isClient) {
  Template.itemList.items = function () {
    return Items.find({}, {sort: {name: 1}});
  };
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
