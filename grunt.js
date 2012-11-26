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
      dev: {
        configFile: 'testacular.conf.js'
      }
    },
    browserStack: {
      dev: {
        credentials: {
          username: browserStackConfig.username,
          password: browserStackConfig.password
        },
        tunnel: {
          key: browserStackConfig.key,
          hosts: [{
            name: 'localhost',
            port: 8001,
            sslFlag: 0
          }]
        },
        start: {
          url: 'http://localhost:8001',
          timeout: 30,
          queueTimeout: 30000,
          browsers: [{
            version: '24.0',
            browser: 'chrome',
            os: 'win'
          }]
        }
      }
    }, 
    browserStackClean: {
      dev: {
        username: browserStackConfig.username,
        password: browserStackConfig.password
      }
    }, 
    browserStackList: {
      dev: {
        username: browserStackConfig.username,
        password: browserStackConfig.password
      }
    } 
  });

  // Default task.
  grunt.registerTask('default', 'lint mochaTest:test');

  // Start services used for development
  grunt.registerTask('devstart', 'testacularServer browserStack');

  // Clean any orphaned browsers used for development
  grunt.registerTask('devclean', 'browserStackClean');

  // List available browsers for development
  grunt.registerTask('devlist', 'browserStackList');
};