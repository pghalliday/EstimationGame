/*
 * grunt-browserstack
 * https://github.com/pghalliday/grunt-browserstack
 *
 * Copyright (c) 2012 Peter Halliday
 * Licensed under the MIT license.
 */

var BrowserStack = require('../lib/BrowserStack');

module.exports = function(grunt) {
  grunt.registerMultiTask('browserStack', 'start browser instances with browserstack and point them at a local port via localtunnel', function() {
    var browserStack = new BrowserStack(this.data);
    browserStack.start(this.async());
  });
};
