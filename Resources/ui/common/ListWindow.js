/**
 * Copyright 2012 by Monique Barbanson. All rights reserved.
 * @author MONIQUE BARBANSON
 */





function createListWindow(doneHandler) {
	'use strict';
	var done = Titanium.UI.createButton({
		systemButton: Titanium.UI.iPhone.SystemButton.DONE
		}),
		listWin = Ti.UI.createWindow({
			backgroundColor: '#ddd',
			color: 'black',
	        statusBarStyle: Ti.UI.iPhone.StatusBar.LIGHT_CONTENT,
	        extendEdges: [Ti.UI.EXTEND_EDGE_LEFT, Ti.UI.EXTEND_EDGE_RIGHT],				
	        title: Ti.Locale.getString('listWindow'),
			rightNavButton: done
		});
	
	done.addEventListener('click', function() {
		var tab = listWin.containingTab;

		if (doneHandler) {
			doneHandler();
		}

		if (tab) {
			tab.close(listWin);			
		}
	});
	
	return listWin;
}


function createListTable(tableData) {
	'use strict';
	return Ti.UI.createTableView({
		data: tableData,
		rowHeight: 50
		//separatorStyle: Titanium.UI.iPhone.TableViewSeparatorStyle.NONE		
	});
}





function populateList(listWindow, friends, check, clickHandler) {
	'use strict';
	var acs = require('lib/acs'),
		defaultFontSize = (Ti.Platform.name === 'android' ? 16 : 14),
		table,
		numFriends = friends.length,
		tableData = [], row,
		i,
		friend, avatar, avatarView,
		title,
		actionFun;
	actionFun = function (fid, add) { 
		Ti.API.info("calling populateList click handler");
		clickHandler(fid, add);
	};
	for (i = 0; i < numFriends; i = i + 1) {
		friend = friends[i];
		if (!friend.first_name || !friend.last_name) {
			title = friend.username;
		}
		else {
			title = friend.first_name + ' ' + friend.last_name;	
		}
		if (friend.email) {
			title = friend.email;
		}			
		avatar = acs.getUserAvatar(friend);
		avatarView = Ti.UI.createImageView({image: avatar, left: 0, height: 50, width: 50});
		row = Ti.UI.createTableViewRow ({
			className: 'friendRow',			
			title: friend.first_name + " " + friend.last_name,
			indentionLevel: 4,
			//leftImage: avatar, 
			id: friend.id, 
			hasCheck: check(friend.id),
			action: actionFun,
			font: {fontSize: defaultFontSize + 2, fontWeight:'bold'},
			height: Ti.UI.FILL			
		});	
		row.add(avatarView);
		tableData.push(row);				
	}
	table = createListTable(tableData);
	
	// create table view event listener
	table.addEventListener('click', function(e) {
		var handler = e.rowData.action;
		e.rowData.hasCheck = !e.rowData.hasCheck; 
		if (handler && !check(e.rowData.id)) {
			//FIXME
			// pass in e.rowData and add if hasCheck is true, remove if false would allow adding *and* removing of fashion buddies
			handler(e.rowData.id, e.rowData.hasCheck); 
		}
	});
	listWindow.add(table);

	return listWindow;	
}


function populateFriendsInviteList(listWindow, friends, fashionBuddies, clickHandler)	{
	'use strict';
	var isFashionBuddy = function (fid) {
		var i = 0,
			numBuddies = fashionBuddies.length,
			found = false;
		for (i = 0; i < numBuddies; i = i + 1) {
			if (fashionBuddies[i].id === fid) {
				found = true;
				break;
			}						
		}
		return found;
	};
	populateList(listWindow, friends, isFashionBuddy, clickHandler);
}

exports.createListWindow = createListWindow;
exports.populateList = populateList;
exports.populateFriendsInviteList = populateFriendsInviteList;