'use strict';

EstimationGameApp.factory('items', function() {
  // Service logic
  // ...

  var items = [];

  // Public API here
  return {
    list: function() {
      return items;
    },
    add: function(item) {
      items.push(item);
    }
  };
});
