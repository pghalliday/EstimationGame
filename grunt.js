module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-testacular');
  grunt.loadTasks('./Source/grunt/tasks');

  var browserStackConfig = require('./browserStackConfig');

  function getLintConfig() {
    return {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        es5: true,
        strict: false
      },
      globals: {
      }
    };
  }
  
  function getNodeLintConfig() {
    var config = getLintConfig();
    config.options.node = true;
    return config;
  }

  function getNodeTestLintConfig() {
    var config = getNodeLintConfig();
    config.globals.describe = false;
    config.globals.it = false;
    config.globals.before = false;
    config.globals.beforeEach = false;
    config.globals.after = false;
    config.globals.afterEach = false;
    return config;
  }

  // Project configuration.
  grunt.initConfig({
    lint: {
      node: ['grunt.js', 'Source/**/*.js', 'Mocks/**/*.js'],
      nodeTest: ['Test/**/*.js']
    },
    jshint: {
      node: getNodeLintConfig(),
      nodeTest: getNodeTestLintConfig()
    },
    mochaTest: {
      test: ['Test/**/*.js']
    },
    mochaTestConfig: {
      test: {
        options: {
          reporter: 'nyan'        
        }
      },
      doc: {
        options: {
          reporter: 'doc'        
        }
      }
    },
    watch: {
      files: ['grunt.js', 'Source/**/*.js', 'Mocks/**/*.js', 'Test/**/*.js'],
      tasks: ['default']
    },
    testacularServer: {
      allowExit: {
        configFile: 'testacular.conf.js'
      }
    },
    browserStackTunnel: {
      keepAlive: {
        keepAlive: true,
        key: browserStackConfig.key,
        hosts: [{
          name: 'localhost',
          port: 8001,
          sslFlag: 0
        }]
      }
    } 
  });

  // Default task.
  grunt.registerTask('default', 'lint mochaTest:test');

  // Start services used for development
  grunt.registerTask('devstart', 'testacularServer browserStackTunnel');
};