Projects = new Meteor.Collection('projects');

if (Meteor.isClient) {
  Template.projectList.projects = function () {
    return Projects.find({}, {sort: {name: 1}});
  };
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
