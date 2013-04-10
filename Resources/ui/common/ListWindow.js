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
			barColor: '#5D3879',
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
		data: tableData
	});
}

function populateList(listWindow, friends, fashionBuddies, clickHandler) {
	'use strict';
	var table,
		numFriends = friends.length,
		tableData = [],
		i,
		friend,
		actionFun,
		isFashionBuddy;
	actionFun = function (fid, add) { 
		Ti.API.info("calling populateList click handler");
		clickHandler(fid, add);
	};
	isFashionBuddy = function (fid) {
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
	for (i = 0; i < numFriends; i = i + 1) {
		friend = friends[i];
		tableData.push({
			title: friend.first_name + " " + friend.last_name, 
			id: friend.id, 
			hasCheck: isFashionBuddy(friend.id),
			action: actionFun
		});				
	}
	table = createListTable(tableData);
	
	// create table view event listener
	table.addEventListener('click', function(e) {
		var handler = e.rowData.action;
		e.rowData.hasCheck = !e.rowData.hasCheck; 
		if (handler) {
			//FIXME
			// pass in e.rowData and add if hasCheck is true, remove if false would allow adding *and* removing of fashion buddies
			handler(e.rowData.id, e.rowData.hasCheck); 
		}
	});
	listWindow.add(table);

	return listWindow;	
}

exports.createListWindow = createListWindow;
exports.populateList = populateList;