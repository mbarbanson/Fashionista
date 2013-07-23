/**
 * copyright 2012-2013 by Monique Barbanson. All rights reserved.
 * @author MONIQUE BARBANSON
 * ContactsWindow.js
 * 
 */

function createContactsWindow(doneHandler) {
	'use strict';
	var done = Titanium.UI.createButton({
				style: Titanium.UI.iPhone.SystemButtonStyle.DONE,
				title: 'Add All'
		}),
		win = Ti.UI.createWindow({
			backgroundColor: '#ddd',
			color: 'black',
			barColor: '#5D3879',
			title: Ti.Locale.getString('contactsWindow'),
			rightNavButton: done
		});

	done.addEventListener('click', function() {
		var tab = win.containingTab;

		if (doneHandler) {
			doneHandler();
		}

		if (tab) {
			tab.close(win);			
		}
	});
	return win;
}		


function isCurrentUser (contact) {
	'use strict';
	var acs = require('lib/acs'),
		currentUser = acs.currentUser(),
		result = false;
		
	if (currentUser && contact && contact.id === currentUser.id) {
		result = true;		
	}

	return result;
}		
		
		
function populateContactsInviteList (contactsWin, contacts, fashionBuddies, contactAction, friendIndex) {
	'use strict';		
	var acs = require('/lib/acs'),
		isFriend = function (contact, buddies) {
						return friendIndex(contact, buddies) !== buddies.length;
					},	
		currentUser = acs.currentUser(),
		android = (Ti.Platform.osname === 'android'),
		// getting all from Android is very slow...
		activityIndicator,
		makeTable, tableview;
	if (android) {
		activityIndicator = Ti.UI.createActivityIndicator({
			message: 'Loading all contacts, please wait...'
		});
		activityIndicator.show();
	}	
	
	makeTable = function() {
		var rows = [], i, title, actionFun, row,
			avatar, contact, avatarView,
			defaultFontSize = (Ti.Platform.name === 'android' ? 16 : 14);
		actionFun = function (contact) {
			var index = friendIndex(contact, fashionBuddies); 
			Ti.API.info("calling populateList click handler");
			if (fashionBuddies.length === 0 || index >= fashionBuddies.length) {
				//add contact as friend 
				contactAction(contact, true);
			}
			else {
				contactAction(contact, false);
			}
		};			
		for (i = 0; i < contacts.length; i = i + 1) {
			contact = contacts[i];
			if (!isCurrentUser(contact)) {
				//Ti.API.info("People object is: "+ contact.first_name + " " + contact.last_name + " " + contact.email);
				if (!contact.first_name || !contact.last_name) {
					if (contact.email) {
						title = contact.email;
					}
					else {
						title = contact.username;
					}
				}
				else {
					title = contact.first_name + ' ' + contact.last_name;	
				}
				avatar = acs.getUserAvatar(contact);
				avatarView = Ti.UI.createImageView({image: avatar, left: 0, height: 30, width: 30});
				
				row = Ti.UI.createTableViewRow({
					className: 'friendRow',
					title: title,
					indentionLevel: 3,				
					person: contact,
					hasCheck: isFriend(contact, fashionBuddies),   // we need to check whether person is currently a friend
					action: actionFun,
					height: Ti.UI.SIZE,
					font: {fontSize: defaultFontSize + 2, fontWeight:'bold'}
				});
				row.add(avatarView);
				rows[i] = row;
			}
		}
		return rows;
	};
	
	tableview = Ti.UI.createTableView({});
	
	tableview.setData(makeTable());

	// create table view event listener
	tableview.addEventListener('click', function(e) {
		var handler = e.rowData.action;
		e.rowData.hasCheck = !e.rowData.hasCheck; 
		if (handler) {
			//FIXME
			// pass in e.rowData and add if hasCheck is true, remove if false would allow adding *and* removing of fashion buddies
			handler(e.rowData.person, e.rowData.hasCheck); 
		}
	});	
	contactsWin.add(tableview);
	if (android && activityIndicator) {activityIndicator.hide();}

	return contactsWin;
}



exports.createContactsWindow = createContactsWindow;
exports.populateContactsInviteList = populateContactsInviteList;