/**
 * copyright 2012-2013 by Monique Barbanson. All rights reserved.
 * @author MONIQUE BARBANSON
 * ContactsWindow.js
 * 
 */

function createContactsWindow(doneHandler) {
	'use strict';
	var done = Titanium.UI.createButton({
				systemButton: Titanium.UI.iPhone.SystemButton.DONE
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
		
		
		
function populateContactsInviteList (contactsWin, contacts, fashionBuddies, contactAction) {
	'use strict';		
	var acs = require('/lib/acs'),
		currentUser = acs.currentUser(),
		isCurrentUser,
		android = (Ti.Platform.osname === 'android'),
		// getting all from Android is very slow...
		activityIndicator,
		makeTable, isFriend, tableview;
	if (android) {
		activityIndicator = Ti.UI.createActivityIndicator({
			message: 'Loading all contacts, please wait...'
		});
		activityIndicator.show();
	}
	
	isCurrentUser = function(contact) {
		var fName = contact.first_name,
			lName = contact.last_name, 
			email = contact.email,
			result = false;
		if (currentUser && currentUser.email && email && currentUser.email === email)	 {
			result = true;		
		}
		else if (currentUser && currentUser.first_name && currentUser.last_name && fName && lName && 
					(currentUser.first_name === fName && currentUser.last_name === lName)) {
			result = true;
		}
		return result;
	};	

	isFriend = function (contact) {
		var fName = contact.first_name,
			lName = contact.last_name, 
			email = contact.email, 
			i, numBuddies = fashionBuddies.length, 
			found = false, 
			buddy;
		for (i = 0; i < numBuddies; i = i + 1) {
			buddy = fashionBuddies[i];
			if ((email && email === buddy.email)	||
				(fName && lName && fName === buddy.first_name && lName === buddy.last_name)) {
					found = true;
					break;
				}		
		}
		return found;				
	};
	
	makeTable = function() {
		var rows = [], i, title, actionFun,
			defaultFontSize = (Ti.Platform.name === 'android' ? 16 : 14);
		actionFun = function (contact, add) { 
			Ti.API.info("calling populateList click handler");
			if (!isFriend(contact)) { contactAction(contact, add); }
		};			
		for (i = 0; i < contacts.length; i = i + 1) {
			if (!isCurrentUser(contacts[i])) {
				Ti.API.info("People object is: "+ contacts[i].first_name + " " + contacts[i].last_name + " " + contacts[i].email);
				
				if (!contacts[i].first_name || !contacts[i].last_name) {
					if (contacts[i].email) {
						title = contacts[i].email;
					}
					else {
						title = contacts[i].username;
					}
				}
				else {
					title = contacts[i].first_name + ' ' + contacts[i].last_name;	
				}			
				rows[i] = Ti.UI.createTableViewRow({
					title: title,
					leftImage: contacts[i].photo,
					person: contacts[i],
					hasCheck: isFriend(contacts[i], fashionBuddies),   // we need to check whether person is currently a friend
					action: actionFun,
					height: Ti.UI.SIZE,
					font: {fontSize:defaultFontSize, fontWeight:'bold'}
				});
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