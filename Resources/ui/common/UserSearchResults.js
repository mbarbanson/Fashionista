/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 **/



(function () {
	'use strict';
	var selectedUser = null;


	function isFriend (contact, fashionBuddies) {
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
	}


	function selectAction (user, add) {
		if (add) {
			Ti.API.info("selectAction: " + user.first_name + ' ' + user.last_name + ' ' + user.username);
			selectedUser = user.id;	
		}
	}	


	function populateResultsList (win, results, fashionBuddies, queryType) {	
		var acs = require('/lib/acs'),
			currentUser = acs.currentUser(),
			selectAction, addFriend,
			isCurrentUser,
			makeTable, tableview, infoLabel,
			doneBtn = Titanium.UI.createButton({
						title: Ti.Locale.getString('addFriend'),
					    style : Ti.UI.iPhone.SystemButtonStyle.DONE
			});	

		doneBtn.addEventListener('click', function() {
			var tab = win.containingTab;
			addFriend();
	
			if (tab) {
				tab.close(win);			
			}
		});
		win.setRightNavButton(doneBtn);

		
		addFriend = function () {
			var acs = require('lib/acs'),
				notificationSuccess = function (e) {
					var dialog = Ti.UI.createAlertDialog({
							title: Ti.Locale.getString('fashionista'), 
							message: Ti.Locale.getString('friendRequestSent') 
						});
					dialog.show();				
				},			
				notifyAddedFriend = function (userIdList) {
					win.close();
			        acs.newFriendNotification(userIdList, notificationSuccess);				        
				};
			if (selectedUser && !isFriend(selectedUser, fashionBuddies)) {
				Ti.API.info("Adding selected User " + selectedUser);
				acs.addFriends([selectedUser], notifyAddedFriend);					
			}
		}; 
		
		makeTable = function() {
			var rows = [], i, title, actionFun, user, avatar,
				defaultFontSize = (Ti.Platform.name === 'android' ? 18 : 16);
			actionFun = function (user, add) { 
				Ti.API.info("calling populateList click handler");
				if (!isFriend(user)) { selectAction(user, add); }
			};			
			for (i = 0; i < results.length; i = i + 1) {
				Ti.API.info("People object is: "+ results[i].first_name + " " + results[i].last_name + " " + results[i].email);
				user = results[i];
				avatar = acs.getUserAvatar(user);
				
				if (!user.first_name || !user.last_name) {
					// only list email if the user already knew it
					if (queryType === 'email' && user.email) {
						title = user.email;
					}
					else {
						title = user.username;
					}
				}
				else {
					title = user.first_name + ' ' + user.last_name;	
				}			
				rows[i] = Ti.UI.createTableViewRow({
					className: 'friendRow',					
					title: title,
					leftImage: avatar,
					person: user,
					hasCheck: isFriend(user, fashionBuddies),   // we need to check whether person is currently a friend
					action: actionFun,
					height: Ti.UI.SIZE,
					font: {fontSize:defaultFontSize, fontWeight:'bold'}
				});
			}
			return rows;
		};
		
		tableview = Ti.UI.createTableView({height: '70%',top: '0%'});
		
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
		win.add(tableview);
		
		infoLabel = Ti.UI.createLabel({
			text : Ti.Locale.getString('infoSearchResults'),
			textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
			verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
			wordWrap : true,
			color : 'black',
			bottom : '0%',
			left : '5%',
			height : 100,
			width : '90%',
			paddingLeft : 2,
			paddingRight : 2,
			font : {
				fontWeight : 'normal',
				fontSize : '14'
			}
		});
		win.add(infoLabel);
	
		return;
	}

	function createSearchResultsWindow(results, parentWin, queryType) {
		var acs = require('/lib/acs'),
			win = Ti.UI.createWindow({
				backgroundColor: '#ddd',
				color: 'black',
				barColor: '#5D3879',
				title: Ti.Locale.getString('searchResultsTitle')
			}),
			tab = parentWin.containingTab;
			
		win.containingTab = tab;	
		acs.getFriendsList(function (fashionBuddies) { populateResultsList(win, results, fashionBuddies, queryType); });
		tab.open(win);
		return win;
	}


	exports.createSearchResultsWindow = createSearchResultsWindow;	
} ());

