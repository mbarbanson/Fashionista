/**
 * @author MONIQUE BARBANSON
 */


function createListWindow() {
	'use strict';
	var done = Titanium.UI.createButton({
		systemButton: Titanium.UI.iPhone.SystemButton.DONE
	}),
		listWin;
		
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
	});
	return listWin;
}

function createListTable(tableData) {
	'use strict';
	return Ti.UI.createTableView({
		data: tableData
	});
}

function populateList(friends, clickHandler) {
	'use strict';
	var listWindow = createListWindow(),
		table,
		numFriends = friends.length,
		tableData = [],
		i,
		friend,
		actionFun;
	actionFun = function () { clickHandler(friend);};
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
			handler();
		}
	});
	listWindow.add(table);

	return listWindow;	
}


exports.populateList = populateList;