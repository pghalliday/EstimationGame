var browserstack = require('browserstack'),
    async = require('async');

function BrowserStack(options) {
  var self = this;
  
  self.start = function(callback) {
    var client = browserstack.createClient({
      username: options.username,
      password: options.password,
      version: 2
    });
    var errors = [];
    var workers = [];
    async.forEach(options.browsers, function(browser, callback) {
      client.createWorker(browser, function(error, worker) {
        if (error) {
          errors.push(error);
        } else {
          workers.push(worker);
        }
        callback();
      });
    }, function(error) {
      // error should be nothing as we never callback with one!
      if (errors.length) {
        async.forEach(workers, function(worker, callback) {
          client.terminateWorker(worker.id, function(error) {
            // add any errors to the errors array
            if (error) {
              errors.push(error);
            }
            callback();
          });
        }, function(error) {
          // error should be nothing as we never callback with one!
          callback(errors);
        });
      } else {
        callback(null, workers);
      }
    });
  };

  function stopWorkers(client, workers, callback) {
    var errors = [];
    async.forEach(workers, function(worker, callback) {
      client.terminateWorker(worker.id, function(error) {
        if (error) {
          errors.push(error);
        }
        callback();
      });
    }, function(error) {
      // error should be nothing as we never callback with one!
      if (errors.length) {
        callback(errors);
      } else {
        callback();
      }
    });
  }

  self.stop = function(workers, callback) {
    var client = browserstack.createClient({
      username: options.username,
      password: options.password,
      version: 2
    });
    if (typeof workers === 'function') {
      callback = workers;
      client.getWorkers(function(error, workers) {
        if (error) {
          callback([error]);
        } else {
          stopWorkers(client, workers, callback);
        }
      });
    } else {
      stopWorkers(client, workers, callback);
    }
  };
}

module.exports = BrowserStack;