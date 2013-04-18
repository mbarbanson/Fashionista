/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */

(function () {
	'use strict';
	
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
				if (fashionistaFriends.length > 0) { acs.addFriends(fashionistaFriends, notifyAddedFriends); }
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
			authCB = function() {
				Ti.API.info("facebook authorize callback");
				social.findFBFriends(fashionBuddiesFilter);
			},
			errorCB = function () {
				activityIndicator.hide();
				parentWin.remove(activityIndicator);				
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
	
		var inviteTable, inviteFBFriendsRow, inviteContactsRow;
		
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
			backgroundColor : '#AAA',
			top : 50,
			height : 40,
			left : 0,
			//borderWidth: 1,
			//borderColor: 'black',
			//leftImage: '/images/contacts-medium.png',
			hasChild : true
		});
	
		inviteTable.appendRow(inviteFBFriendsRow);
		inviteTable.fbFriendsRow = inviteFBFriendsRow;
		inviteTable.appendRow(inviteContactsRow);
		inviteTable.contactsRow = inviteContactsRow;
	
		return inviteTable;
	}

	exports.createInviteView = createInviteView;
	exports.inviteFBFriendsPromptBeforeAction = inviteFBFriendsPromptBeforeAction;
	exports.inviteFBFriendsHandler = inviteFBFriendsHandler;

} ());

