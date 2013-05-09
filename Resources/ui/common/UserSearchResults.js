/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 **/



(function () {
	'use strict';


	function populateResultsList (win, results, fashionBuddies, selectAction, queryType) {	
		var acs = require('/lib/acs'),
			currentUser = acs.currentUser(),
			isCurrentUser,
			makeTable, isFriend, tableview, infoLabel;	
	
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
				defaultFontSize = (Ti.Platform.name === 'android' ? 18 : 16);
			actionFun = function (user, add) { 
				Ti.API.info("calling populateList click handler");
				if (!isFriend(user)) { selectAction(user, add); }
			};			
			for (i = 0; i < results.length; i = i + 1) {
				Ti.API.info("People object is: "+ results[i].first_name + " " + results[i].last_name + " " + results[i].email);
				
				if (!results[i].first_name || !results[i].last_name) {
					// only list email if the user already knew it
					if (queryType === 'email' && results[i].email) {
						title = results[i].email;
					}
					else {
						title = results[i].username;
					}
				}
				else {
					title = results[i].first_name + ' ' + results[i].last_name;	
				}			
				rows[i] = Ti.UI.createTableViewRow({
					title: title,
					leftImage: results[i].photo,
					person: results[i],
					hasCheck: isFriend(results[i], fashionBuddies),   // we need to check whether person is currently a friend
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
	
		return win;
	}

	function createSearchResultsWindow(results, parentWin, queryType) {
		var acs = require('/lib/acs'),
			doneBtn = Titanium.UI.createButton({
						title: Ti.Locale.getString('addFriend'),
					    style : Ti.UI.iPhone.SystemButtonStyle.DONE
			}),
			win = Ti.UI.createWindow({
				backgroundColor: '#ddd',
				color: 'black',
				barColor: '#5D3879',
				title: Ti.Locale.getString('searchResultsTitle'),
				rightNavButton: doneBtn
			}),
			tab = parentWin.containingTab,
			selectedUser,
			selectAction = function (user, add) {
				if (add) {
					Ti.API.info("selectAction: " + user.first_name + ' ' + user.last_name + ' ' + user.username);
					selectedUser = user.id;	
				}
			},
			addSelectedUser = function () {
				var acs = require('lib/acs'),
					notifyAddedFriend = function (userIdList) {
						win.close();
				        acs.newFriendNotification(userIdList);				        
					};
				Ti.API.info("Adding selected User " + selectedUser);
				acs.addFriends([selectedUser], notifyAddedFriend);
				alert(Ti.Locale.getString('friendRequestSent'));
			}; 
			
		win.containingTab = tab;
		tab.open(win);	
		doneBtn.addEventListener('click', function() {
			var tab = win.containingTab;
	
			addSelectedUser();
	
			if (tab) {
				tab.close(win);			
			}
		});
		acs.getFriendsList(function (fashionBuddies) { populateResultsList(win, results, fashionBuddies, selectAction, queryType); });
		
		return win;
	}


	exports.createSearchResultsWindow = createSearchResultsWindow;	
} ());

