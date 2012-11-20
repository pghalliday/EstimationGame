/*
 * grunt-browserstack
 * https://github.com/pghalliday/grunt-browserstack
 *
 * Copyright (c) 2012 Peter Halliday
 * Licensed under the MIT license.
 */

var BrowserStackTunnel = require('browserstacktunnel-wrapper');

module.exports = function(grunt) {
  grunt.registerMultiTask('browserStackTunnel', 'start the browserstack tunnel', function() {
    var self = this;
    var done = self.async();
    var browserStackTunnel = new BrowserStackTunnel(self.data.key, self.data.hosts);
    browserStackTunnel.start(function(error) {
      if (error) {
        done(error);
      } else {
        grunt.log.ok('BrowserStackTunnel has started');
        if (!self.data.keepAlive) {
          done();
        }
      }
    });
  });
};
