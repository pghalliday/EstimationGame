'use strict';

describe('Controller: MainCtrl', function() {

  // load the controller's module
  beforeEach(module('EstimationGameApp'));

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    scope = {};
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of roadmap items to the scope', function() {
    expect(scope.roadmapItems.length).toBe(3);
  });
});
