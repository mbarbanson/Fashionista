/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */

(function () {
	'use strict';
	
	function getQueryType(query) {
		var type = null, keys = Object.keys(query);
		if (keys.length !== 0) {
			switch (keys[0]) {
				case '$or':
					type = 'name';
					break;
				case 'username':
					type = 'username';
					break;
				case 'email':
					type = 'email';
					break;
			}			
		}
		return type;		
	}
	
	function goToUserSearch(parentWin) {
		var UserSearchResults = require('ui/common/UserSearchResults'),
			UserSearchWindow = require('ui/common/UserSearchWindow'),
			successCallback = function (users, query) {
									if (users.length > 0) {
										UserSearchResults.createSearchResultsWindow(users, parentWin, getQueryType(query));  
									}// go to list of search results to let user pick the right match in case there is more than one
								},
			errorCallback,	// sorry we could not find any results to this search. Please add some information and try again.  
			userSearchWin = UserSearchWindow.createUserSearchWindow(successCallback, errorCallback),
			rightButton = userSearchWin.getRightNavButton(),
			tab = parentWin.containingTab;
		userSearchWin.containingTab = tab;
		tab.open(userSearchWin);	
	}
	
	function inviteContactsClickHandler (parentWin) {
		var Contacts = require('lib/contacts'),
			ContactsWindow = require('ui/common/ContactsWindow'),
			social = require('lib/social'),
			acs = require('lib/acs'),
			contactsList = [], 
			activityIndicator = Ti.UI.createActivityIndicator({style: Ti.App.darkSpinner, top: '50%', left: '50%'}),
			selectContact = function (contact, add) {
				if (add) {
					Ti.API.info("selectContact: " + contact.first_name + ' ' + contact.last_name);
					contactsList.push(contact.id);	
				}
				else {
					// if contact is in the list remove
					var index = contactsList.indexOf(contact.id);
					if (index > -1) {contactsList.splice(index, 1);}
				}
			},
			addSelectedContacts = function () {
				var acs = require('lib/acs'),
					notifyAddedFriends = function (userIdList) {
				        acs.newFriendNotification(userIdList);
					};
				Ti.API.info("Adding selected Contacts " + contactsList);
				if (contactsList.length > 0) { 
					acs.addFriends(contactsList, notifyAddedFriends);
					alert(Ti.Locale.getString('friendRequestSent')); 
				}
			},
			displayContactsOnFashionist = function(contacts, fashionBuddies) {
				var contactsWin, 
					rightButton, 
					tab = parentWin.containingTab,
					i, numContacts = contacts.length;
				if (contacts && numContacts > 0) {
					Ti.API.info("create and populate list of contacts window");
					contactsWin = ContactsWindow.createContactsWindow(addSelectedContacts);
					contactsWin.containingTab = tab;
					rightButton = contactsWin.getRightNavButton();
					tab.open(contactsWin);
					
					activityIndicator.hide();
					parentWin.remove(activityIndicator);
					contactsWin.setRightNavButton(activityIndicator);
					activityIndicator.show();
					
					// this is where we check which contact are already the current user's Fashionista friends
					ContactsWindow.populateContactsInviteList(contactsWin, contacts, fashionBuddies, selectContact);

					activityIndicator.hide();
					contactsWin.setRightNavButton(rightButton);								
				} else { // this shouldn't happen here anymore, we bail out in fashionBuddiesFilter now
					alert(Ti.Locale.getString('firstuser'));
					activityIndicator.hide();
					parentWin.remove(activityIndicator);								
				}
			},
			fashionBuddiesFilter = function (contacts) {
					// no user found in list of contacts
				if (!Array.isArray(contacts) ||  contacts.length === 0 ||
					// the only user we found is the current user 
					(contacts.length === 1 && contacts.indexOf(acs.currentUser()) >= 0 )) {
					alert(Ti.Locale.getString('firstContact'));
					activityIndicator.hide();
					parentWin.remove(activityIndicator);
					goToUserSearch(parentWin);					
				}
				else {
					acs.getFriendsList(function (fashionBuddies) { displayContactsOnFashionist (contacts, fashionBuddies); });					
				}
			},
			errorCallback = function () {
				alert (Ti.Locale.getString("contactsDisallowed"));
				activityIndicator.hide();
				parentWin.remove(activityIndicator);				
			},			
			performAddressBookFunction = function() {
				Ti.API.info("contacts access success callback");
				Contacts.findContactsOnFashionist(fashionBuddiesFilter, errorCallback);
			};
			
		parentWin.add(activityIndicator);
		activityIndicator.show();	
		Contacts.requestContactsAccess(performAddressBookFunction, errorCallback);					
	}
	
	function inviteFBFriendsHandler(parentWin) {
		var ListWindow = require('ui/common/ListWindow'),
			social = require('lib/social'),
			acs = require('lib/acs'),
			fashionistaFriends = [],
			activityIndicator = Ti.UI.createActivityIndicator({style: Ti.App.darkSpinner, top: '50%', left: '50%'}),
			selectFBFriend = function(friendId, add) {
				if (add) {
					Ti.API.info("selectFBFriend id: " + friendId);
					fashionistaFriends.push(friendId);	
				}
				else {
					// if friendId is already in the list, remove it
					var index = fashionistaFriends.indexOf(friendId);
					if (index > -1) {fashionistaFriends.splice(index, 1);}
				}
			},
			addSelectedFBFriends = function() {
				var acs = require('lib/acs'),
					notifyAddedFriends = function (userIdList) {
				        acs.newFriendNotification(userIdList);
					};
				Ti.API.info("Adding selected FB Friends " + fashionistaFriends);
				if (fashionistaFriends.length > 0) { 
					acs.addFriends(fashionistaFriends, notifyAddedFriends);
					alert(Ti.Locale.getString('friendRequestSent'));
				}
			},
			callback = function(friends, fashionBuddies) {
							var listWin, rightButton, tab = parentWin.containingTab;
							if (friends && friends.length > 0) {
								Ti.API.info("create and populate list of friends window");
								listWin = ListWindow.createListWindow(addSelectedFBFriends);
								rightButton = listWin.getRightNavButton();
								tab.open(listWin);
								
								activityIndicator.hide();
								parentWin.remove(activityIndicator);
								listWin.setRightNavButton(activityIndicator);
								activityIndicator.show();
								
								// this is where we check which FB friends are already the current user's Fashionista friends
								ListWindow.populateFriendsInviteList(listWin, friends, fashionBuddies, selectFBFriend);
								listWin.containingTab = tab;

								activityIndicator.hide();
								listWin.setRightNavButton(rightButton);								
							} else {
								alert(Ti.Locale.getString('firstuser'));
								activityIndicator.hide();
								parentWin.remove(activityIndicator);								
							}
						},
			fashionBuddiesFilter = function (fbFriends) {acs.getFriendsList(function (fashionBuddies) {callback(fbFriends, fashionBuddies);});},
			//facebook integration
			FB = require('lib/facebook'),
			errorCB = function () {
				activityIndicator.hide();
				parentWin.remove(activityIndicator);				
			},			 
			authCB = function() {
				Ti.API.info("facebook authorize callback");
				social.findFBFriends(fashionBuddiesFilter, errorCB);
			};
			
		parentWin.add(activityIndicator);
		activityIndicator.show();	
	    // user has been prompted to request friends once, don't prompt until next time the app is started
		acs.setHasRequestedFriends(true);			
		FB.authorize(authCB, errorCB);		
	}
	
	function inviteFBFriendsPromptBeforeAction(window, action) {
		var acs = require('lib/acs'),
			//inviteFBFriendsRow = inviteTable ? inviteTable.fbFriendsRow : null,
			activityIndicator = Ti.UI.createActivityIndicator({style: Ti.App.spinnerStyle}),
			//window = inviteTable.window,
			rightButton,
			hasFriends = function (fList) { return fList.length > 0; },
			getFriendsSuccessCallback = function (fList) {
				// no friends yet! prompt to select and add friends
				if (!hasFriends(fList) && !acs.getHasRequestedFriends()) {
					  var dialog = Ti.UI.createAlertDialog({
									    cancel: 0,
									    persistent: true,
									    buttonNames: ['Not Now', 'Yes'],
									    message: Ti.Locale.getString('findFriendsMessage'),
									    title: Ti.Locale.getString('findFriendsTitle')
									  });
									  dialog.addEventListener('click', function(e){
									    if (e.index === 1){
											//inviteFBFriendsRow.fireEvent('click', {});
											inviteFBFriendsHandler(window);
									    }
									    else {
											Ti.API.info('The button ' + e.index + ' was clicked');
										    // user has been prompted to request friends once, move on until next time the app is started
											acs.setHasRequestedFriends(true);
											action();
									    }
										if (window) {
											activityIndicator.hide();
											window.setRightNavButton(rightButton);
										}
									  });
									  dialog.show();				
				}
				// user already has friends, go ahead and share
				else if (action) { 
					if (window) {
						activityIndicator.hide();
						window.setRightNavButton(null);
						window.setRightNavButton(rightButton);
					}					
					action();
				}
			};
			if (window) {
				rightButton = window.getRightNavButton();
				window.setRightNavButton(activityIndicator);
				activityIndicator.show();
			}
			
			acs.getFriendsList(getFriendsSuccessCallback);
	}



	function createInviteView(parentWin, offsetTop) {
	
		var inviteTable, inviteFBFriendsRow, inviteContactsRow, userSearchRow;
		
		inviteTable = Ti.UI.createTableView({
			//bottom: 40,
			top: offsetTop || 140,
			height : Ti.UI.SIZE,
			rowHeight : 50,
			width : '90%',
			left : '5%',
			borderRadius : 5,
			backgroundColor : 'transparent',
			paddingLeft : 0,
			paddingRight : 2
		});
		
		inviteTable.window = parentWin;
	
		inviteFBFriendsRow = Ti.UI.createTableViewRow({
			className : 'shareSource',
			title : Ti.Locale.getString('useFacebook'),
			color : 'black',
			backgroundColor : '#fff',
			height : 40,
			left : 0,
			//leftImage: '/images/f_logo.png',
			hasChild : true
		});
	
		inviteFBFriendsRow.addEventListener('click', function (e) { inviteFBFriendsHandler (parentWin); } );
	
		inviteContactsRow = Ti.UI.createTableViewRow({
			className : 'shareSource',
			title : Ti.Locale.getString('useContacts'),
			color : 'black',
			backgroundColor : '#FFF',
			top : 50,
			height : 40,
			left : 0,
			//borderWidth: 1,
			//borderColor: 'black',
			//leftImage: '/images/contacts-medium.png',
			hasChild : true
		});
		
		inviteContactsRow.addEventListener('click', function(e) { inviteContactsClickHandler (parentWin); });
		
			
		userSearchRow = Ti.UI.createTableViewRow({
			className : 'shareSource',
			title : Ti.Locale.getString('userSearch'),
			color : 'black',
			backgroundColor : '#FFF',
			top : 50,
			height : 40,
			left : 0,
			//borderWidth: 1,
			//borderColor: 'black',
			//leftImage: '/images/contacts-medium.png',
			hasChild : true
		});
		
		userSearchRow.addEventListener('click', function(e) { goToUserSearch (parentWin); });
	
		inviteTable.appendRow(inviteFBFriendsRow);
		inviteTable.fbFriendsRow = inviteFBFriendsRow;
		inviteTable.appendRow(inviteContactsRow);
		inviteTable.contactsRow = inviteContactsRow;
		inviteTable.appendRow(userSearchRow);
		inviteTable.userSearchRow = userSearchRow;
		
			
		return inviteTable;
	}

	exports.createInviteView = createInviteView;
	exports.inviteFBFriendsPromptBeforeAction = inviteFBFriendsPromptBeforeAction;
	exports.inviteFBFriendsHandler = inviteFBFriendsHandler;

} ());

