/*
	UI component: Logout
*/


var LogoutWindow = function() {

	var acs;
	
	acs = require('lib/acs');
	
	lWin = Ti.UI.createWindow({
		backgroundColor: '#333',
		barColor: '#5D3879',
		title: L('logout')
	});

    var logoutBtn = Ti.UI.createButton({
        title: L('logout'),
        top:25,
		width: '90%',
		height: 40,
		font: {
			fontWeight: 'normal',
			fontSize: '17'
		},
		textAlign: 'center',
    });
    lWin.add(logoutBtn);

	var logoutCallback = function () {
		Ti.API.info('Congratulations, you successfully logged out. ');
		var LoginWindow = require('ui/common/LoginWindow');
		var loginWindow = new LoginWindow('login', function () {loginCallback(loginWindow);});
		var tab = lWin.containingTab;
		loginWindow.containingTab = tab;
		// open loginWindow on top of the tab window stack
		tab.open(loginWindow);
		// no back button. user shouldn't be able to go back to the logout window since we're already logged out
		loginWindow.setLeftNavButton = null;
	}
	
	var loginCallback = function (loginWin) {
		// successfully logged in
		if(acs.isLoggedIn()===true) {
			var tab = loginWin.containingTab;
			// close login window
			tab.close(loginWin);
		    var ApplicationTabGroup = require('ui/common/ApplicationTabGroup');
		    ApplicationTabGroup.setDefaultActiveTab();
		}
	    else {
	    	//FIXME this shouldn't happen
	    	Ti.API.info("login failed. go to sign up");
	    }
	}
	
	// event listeners
	logoutBtn.addEventListener('click', function() {
		acs.logout(logoutCallback);
	});
	
	return lWin;
};

module.exports = LogoutWindow;