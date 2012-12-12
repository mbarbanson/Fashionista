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
			title: L('listWindow'),
			rightNavButton: done
		});
	
	done.addEventListener('click', function() {
		var tab = listWin.containingTab;
		if (tab) {
			tab.close(listWin);			
		}
		if (doneHandler) {
			doneHandler();
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

function populateList(listWindow, friends, clickHandler) {
	'use strict';
	var table,
		numFriends = friends.length,
		tableData = [],
		i,
		friend,
		actionFun;
	actionFun = function (fid) { 
		Ti.API.info("calling populateList click handler");
		clickHandler(fid);
	};
	for (i = 0; i < numFriends; i = i + 1) {
		friend = friends[i];
		tableData.push({
			title: friend.first_name + " " + friend.last_name, 
			id: friend.id, 
			hasChild: true,
			action: actionFun
		});				
	}
	table = createListTable(tableData);
	
	// create table view event listener
	table.addEventListener('click', function(e) {
		var handler = e.rowData.action;
		if (handler) {
			handler(e.rowData.id);
		}
	});
	listWindow.add(table);

	return listWindow;	
}

exports.createListWindow = createListWindow;
exports.populateList = populateList;