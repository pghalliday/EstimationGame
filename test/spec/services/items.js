'use strict';

describe('Service: items', function () {

  // load the service's module
  beforeEach(module('EstimationGameApp'));

  // instantiate service
  var items;
  beforeEach(inject(function(_items_) {
    items = _items_;
  }));

  it('should initialise with an empty collection of items', function () {
    expect(items.list().length).toBe(0);
  });

  it('should allow items to be added', function() {
    items.add({
      name: 'item1'
    });
    expect(items.list().length).toBe(1);
    expect(items.list()[0].name).toBe('item1');
    items.add({
      name: 'item2'
    });
    expect(items.list().length).toBe(2);
    expect(items.list()[1].name).toBe('item2');
    items.add({
      name: 'item3'
    });
    expect(items.list().length).toBe(3);
    expect(items.list()[2].name).toBe('item3');
  });

});
