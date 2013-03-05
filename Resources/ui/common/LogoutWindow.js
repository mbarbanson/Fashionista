/*
	UI component: Logout
*/

function createLogoutWindow() {
	'use strict';

	return Ti.UI.createWindow({
		backgroundColor: '#333',
		barColor: '#5D3879',
		title: L('logout')
	});	
}	


function initLogoutWindow(logoutWin, containingTab) {
	'use strict';
	var acs, 
		FB, 
		ApplicationTabGroup,
		logoutBtn;
	
	acs = require('lib/acs');
	FB = require('lib/facebook');
	ApplicationTabGroup = require('ui/common/ApplicationTabGroup');
	
    logoutBtn = Ti.UI.createButton({
        title: L('logout') + " " + acs.currentUser().username,
        top:25,
		width: '90%',
		height: 40,
		font: {
			fontWeight: 'normal',
			fontSize: '17'
		},
		textAlign: 'center'
    });
    logoutWin.add(logoutBtn);

	function loginCallback (loginWin) {
		var //ApplicationTabGroup = require('ui/common/ApplicationTabGroup'),
			acs = require('lib/acs');
			
		// successfully logged in
		if(acs.isLoggedIn()) {			
		    logoutWin.fireEvent('newLoggedInUser');
			containingTab.close(loginWin);
		}
	    else {
			Ti.API.info("FIXME: login failed. go to sign up");
	    }
	}
		
		
	function logoutCallback () {
		var acs = require('lib/acs'),
			LoginWindow = require('ui/common/LoginWindow'),
			loginWindow;
			
		Ti.API.info('Congratulations, you successfully logged out');
		
		loginWindow = LoginWindow.createLoginWindow('login', function () {loginCallback(loginWindow);});
		containingTab.open(loginWindow);
	}


	// event listeners
	logoutBtn.addEventListener('click', function() {
		acs.logout(logoutCallback);
		//do not logout of FB. Should only have to relink accounts if accessToken expires
	});
	
	logoutWin.addEventListener('newLoggedInUser', function () {
		var tabGroup = Ti.App.mainTabGroup;
		logoutBtn.title = L('logout') + " " + acs.currentUser().username;
		tabGroup.fireEvent('newLoggedInUser');
		ApplicationTabGroup.setDefaultActiveTab(tabGroup);
	});
	
	return logoutWin;
}

exports.initLogoutWindow = initLogoutWindow;
exports.createLogoutWindow = createLogoutWindow;