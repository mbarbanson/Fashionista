/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */

(function () {
	'use strict';
	
	var inAddingFriends = false,
		inRemovingFriends = false;
	
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
			ProfileView = require('ui/common/ProfileView'),
			tab = parentWin.containingTab,			
			successCallback = function (users, query) {
									if (users.length > 0) {
										//UserSearchResults.createSearchResultsWindow(users, parentWin, getQueryType(query));
										ProfileView.displayUserProfile(tab, users[0]);  
									}
								},
			errorCallback,	  
			userSearchWin = UserSearchWindow.createUserSearchWindow(successCallback, errorCallback),
			rightButton = userSearchWin.getRightNavButton();

		userSearchWin.containingTab = tab;
		tab.open(userSearchWin);	
	}
	
	
	function inviteContactsClickHandler (parentWin) {
		var Contacts = require('lib/contacts'),
			ContactsWindow = require('ui/common/ContactsWindow'),
			social = require('lib/social'),
			acs = require('lib/acs'),
			friendsToAdd = [], 
			activityIndicator = Ti.UI.createActivityIndicator({style: Ti.App.darkSpinner, top: '50%', left: '50%'}),
			notificationSuccess = function (e) {
				var dialog = Ti.UI.createAlertDialog({
						title: Ti.Locale.getString('fashionista'), 
						message: Ti.Locale.getString('friendRequestSent') 
					});
				dialog.show();				
			},
			notifyRemovedFriends = function (e){
										var dialog = Ti.UI.createAlertDialog({title: Ti.Locale.getString('fashionista'), message: 'Removed a friend successfully'});
										dialog.show();
									},
			notifyAddedFriends = function (userIdList) {
							        acs.newFriendNotification(userIdList, notificationSuccess);
								},			
			displayContactsOnFashionist = function(contacts, fashionBuddies) {
				var contactsWin, 
					rightButton, 
					tab = parentWin.containingTab,
					i, numContacts = contacts.length,
					friendIndex = function (contact, buddies) {
									var fName = contact.first_name,
										lName = contact.last_name, 
										email = contact.email, 
										i, numBuddies = buddies.length, 
										//found = false, 
										buddy;
									for (i = 0; i < numBuddies; i = i + 1) {
										buddy = buddies[i];
										if ((email && (email === buddy.email))	||
											(fName && lName && fName === buddy.first_name && lName === buddy.last_name)) {
												//found = true;
												break;
											}		
									}
									return i;				
								},
					isFriend = function (contact, buddies) {
									return friendIndex(contact, buddies) !== buddies.length;
								},
					// since we're allowing adding and removing by checking off the contacts that were checked on,
					// adding and removing contacts one by one
					selectContact = function (contact, add) {
						var contactsToAdd = [contact.id];						
						if (add) {
							Ti.API.info("add contact as friend: " + contact.first_name + ' ' + contact.last_name);
							//contactsList.push(contact.id);
							inAddingFriends = true;
							acs.addFriends(contactsToAdd, function (e) {
															fashionBuddies.push (contact); 
															notifyAddedFriends (contact.id.toString());
															inAddingFriends = false;
															});	
						}
						/*
						else {
							// if contact is in the list remove
							// Ti.API.info("remove contact as friend: " + contact.first_name + ' ' + contact.last_name);
							FIXME never remove friends since it's looking like there's a race condition in ACS. come back to this later
							inRemovingFriends = true;
							acs.removeFriends(contactsToAdd, function (e) {
																var index = friendIndex(contact, fashionBuddies);
																if (index > -1 && index < fashionBuddies.length) {
																	fashionBuddies.splice(index, 1);
																}
																notifyRemovedFriends (contactsToAdd);
																inRemovingFriends = false;
															});
																
						}
						*/
					},
					// not used for now since we add/remove as contacts are selected/unselected								
					addSelectedContacts = function () {
						var acs = require('lib/acs'),
							friendsToAdd, 
							friendFilter = function (u) {
									return !isFriend(u, fashionBuddies);
								};
						friendsToAdd = contacts.filter(friendFilter);
						friendsToAdd = friendsToAdd.map(function (u) {return u.id;});				 
						Ti.API.info("Adding selected Contacts " + friendsToAdd);
						if (friendsToAdd.length > 0) { 
							acs.addFriends(friendsToAdd, notifyAddedFriends);
						}
					};
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
					ContactsWindow.populateContactsInviteList(contactsWin, contacts, fashionBuddies, selectContact, friendIndex);

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
			notificationSuccess = function (e) {
				var dialog = Ti.UI.createAlertDialog({
						title: Ti.Locale.getString('fashionista'), 
						message: Ti.Locale.getString('friendRequestSent') 
					});
				dialog.show();				
			},			
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
				        acs.newFriendNotification(userIdList, notificationSuccess);
					};
				Ti.API.info("Adding selected FB Friends " + fashionistaFriends);
				if (fashionistaFriends.length > 0) { 
					acs.addFriends(fashionistaFriends, notifyAddedFriends);
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
			fashionBuddiesFilter = function (fbFriends) {
				acs.getFriendsList(function (fashionBuddies) {
					callback(fbFriends, fashionBuddies);
					});
				},
			//facebook integration
			FB = require('lib/facebook'),
			cleanupCB = function () {
				activityIndicator.hide();
				parentWin.remove(activityIndicator);				
			},			 
			authCB = function() {
				Ti.API.info("facebook authorize callback");
				social.findFBFriends(fashionBuddiesFilter, cleanupCB);
			};
			
		parentWin.add(activityIndicator);
		activityIndicator.show();	
	    // user has been prompted to request friends once, don't prompt until next time the app is started
		acs.setHasRequestedFriends(true);			
		FB.authorize(authCB, cleanupCB);		
	}


	function inviteFriendsBeforeShare(tab, action) {
		var acs = require('lib/acs'),
			SettingsWindow = require('ui/common/SettingsWindow'),
			window = Ti.UI.createWindow({
								backgroundColor: '#DDD',
						        statusBarStyle: Ti.UI.iPhone.StatusBar.LIGHT_CONTENT,
						        extendEdges: [Ti.UI.EXTEND_EDGE_LEFT, Ti.UI.EXTEND_EDGE_RIGHT]				
			}),
			//inviteFBFriendsRow = inviteTable ? inviteTable.fbFriendsRow : null,
			activityIndicator = Ti.UI.createActivityIndicator({style: Ti.App.spinnerStyle}),
			//window = inviteTable.window,
			rightButton,
			cachedFriends = acs.getSavedFriendIds(),
			hasFriends = function (fList) { return fList.length > 0; },
			getFriendsSuccessCallback = function (fList) {
				// no friends yet! prompt to select and add friends
				if (!hasFriends(fList) && !acs.getHasRequestedFriends()) {
					  var dialog = Ti.UI.createAlertDialog({
									    cancel: 0,
									    persistent: true,
									    buttonNames: ['Not Now', 'OK'],
									    message: Ti.Locale.getString('findFriendsMessage'),
									    title: Ti.Locale.getString('findFriendsTitle')
									  });
									  dialog.addEventListener('click', function(e){
									    if (e.index === 1){
											//inviteFBFriendsRow.fireEvent('click', {});
											//inviteFBFriendsHandler(window);
											SettingsWindow.displayFriends(window);
											window.containingTab = tab;
											tab.open(window);
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
			
			//acs.getFriendsList(getFriendsSuccessCallback);
			// use cachedFriends instead of making another round trip to the server
			getFriendsSuccessCallback(cachedFriends);
	}

	function createInviteView(parentWin, offsetTop) {
	
		var inviteTable, 
			inviteFBFriendsRow, fbImage,
			inviteContactsRow, contactsImage, 
			userSearchRow, userImage;
		
		inviteTable = Ti.UI.createTableView({
			top: offsetTop || 140,
			height : Ti.UI.SIZE,
			rowHeight : 50,
			width : '90%',
			left : '5%',
			borderRadius : 5,
			//borderColor: 'black',
			//borderWidth: 1,
			backgroundColor: 'white',
			//selectedBackgroundColor: 'transparent',
			paddingLeft : 0,
			paddingRight : 2,
			paddingTop: 10
		});
		
		inviteTable.window = parentWin;
		
		fbImage = Ti.UI.createImageView({image: '/images/f_logo_small.png', left:0, height: 50, width: 50});
		inviteFBFriendsRow = Ti.UI.createTableViewRow({
			className : 'shareSource',
			title : Ti.Locale.getString('useFacebook'),
			color : 'black',
			indentionLevel: 4,			
			backgroundColor : '#fff',
			top: 10,
			height : 50,
			left : 0,
			font: {fontSize: 16, fontWeight: 'bold'},
			hasChild : true
			});
		inviteFBFriendsRow.add(fbImage);	
		inviteFBFriendsRow.addEventListener('click', 
						function (e) { 
											inviteFBFriendsHandler (parentWin);
									}
						);
	
		contactsImage = Ti.UI.createImageView({image: '/images/contacts-small.png', left:0, height: 50, width: 50});
		inviteContactsRow = Ti.UI.createTableViewRow({
			className : 'shareSource',
			title : Ti.Locale.getString('useContacts'),
			color : 'black',
			indentionLevel: 4,			
			backgroundColor : '#FFF',
			top : 10,
			height : 50,
			left : 0,
			font: {fontSize: 16, fontWeight: 'bold'},
			hasChild : true
			});
		inviteContactsRow.add(contactsImage);
		inviteContactsRow.addEventListener('click', function(e) { inviteContactsClickHandler (parentWin); });
		
		userImage = Ti.UI.createImageView({image: '/icons/111-user.png', left:10, height: Ti.UI.SIZE, width: Ti.UI.SIZE});	
		userSearchRow = Ti.UI.createTableViewRow({
			className : 'shareSource',
			title : Ti.Locale.getString('userSearch'),
			color : 'black',
			backgroundColor : '#FFF',
			indentionLevel: 4,			
			top : 10,
			height : 50,
			left : 0,
			font: {fontSize: 16, fontWeight: 'bold'},			
			hasChild : true
		});
		userSearchRow.add(userImage);
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
	//exports.inviteFBFriendsPromptBeforeAction = inviteFBFriendsPromptBeforeAction;
	exports.inviteFBFriendsHandler = inviteFBFriendsHandler;
	exports.inviteFriendsBeforeShare = inviteFriendsBeforeShare;

} ());

