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
		Ti.API.info('Congratulations, you successfully logged out in. ');
		var LoginWindow = require('ui/common/LoginWindow');
		var loginWindow = new LoginWindow('login', function () {loginCallback(loginWindow);});
		var tab = lWin.containingTab;
		loginWindow.containingTab = tab;
		// open loginWindow on top of the tab window stack
		tab.open(loginWindow);
	}
	
	var loginCallback = function (loginWin) {
		// successfully logged in
		if(acs.isLoggedIn()===true) {
			var tab = loginWin.containingTab;
			// close login window
			tab.close(loginWin);
			// open logout window. do we need to do this or does the logout Window show 
			// since it is at the bttom of the tab window stack?
			//tab.open(lWin);
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