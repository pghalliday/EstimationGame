Items = new Meteor.Collection('items');

if (Meteor.isClient) {
	Template.itemList.items = function () {
		return Items.find({}, {sort: {name: 1}});
	};

	Template.itemList.events({
		'click button.add': function () {
			// TODO: how do i get this under test! There is definitely important logic here
			if ($.trim($('#name').val()) !== '') {
				Items.insert({name: $('#name').val(), estimate: $('#estimate').val()});
				$('#name').val('');
				$('#estimate').val('');
				$('#name').focus();
			}
		},
		'click button.remove': function () {
			// TODO: how do i get this under test! There is definitely important logic here
		    var item = Items.findOne(Session.get("selectedItem"));
			if (item) {
				Items.remove(item);
				Session.set("selectedItem", undefined);
				$('#name').focus();
			}
		}

	});

	Template.itemRow.selected = function () {
		return Session.equals("selectedItem", this._id);
	};

	Template.itemRow.events({
		'click': function () {
			Session.set("selectedItem", this._id);
		}
	});
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}