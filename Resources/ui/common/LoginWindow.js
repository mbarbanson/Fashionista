/*
	UI component: Login / Create user dialog
*/


var LoginWindow = function(action, cb) {

	var acs, isLogin, dialogHeight, lWin, done, 
		winTitle, flexSpace, lwDialog, 
		username, password, confirm;
	
	acs = require('lib/acs');
	
	isLoginAction = (action === 'login');
		
	done = Titanium.UI.createButton({
		systemButton: Titanium.UI.iPhone.SystemButton.DONE
	});
	
	lWin = Ti.UI.createWindow({
		backgroundColor: '#333',
		barColor: '#5D3879',
		rightNavButton: done,
		title: L(action)
	});

	winTitle = Titanium.UI.createButton({
		color: 'white',	
		focusable: false,
		enabled: true,
		title: L(action),
		font: {fontFamily: 'Thonburi', fontsize: 14},
		style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN
	});
	       	    
    flexSpace = Titanium.UI.createButton({
        systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });

	username = Ti.UI.createTextField({
		hintText:L('username'),
		autocorrect: false,
		autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
		top:25,
		width: '90%',
		height: 40,
		font: {
			fontWeight: 'normal',
			fontSize: '17'
		},
		textAlign: 'center',
		color: '#333',
		backgroundColor: '#ddd',
		borderRadius: 3,
		paddingLeft: 2, paddingRight: 2
	});
	
	lWin.add(username);
	
	password = Ti.UI.createTextField({
		hintText:L('password'),
		passwordMask: true,
		autocorrect: false,
		autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
		top:70,
		width: '90%',
		height: 40,
		font: {
			fontWeight: 'normal',
			fontSize: '17'
		},
		textAlign: 'center',
		color: '#333',
		backgroundColor: '#ddd',
		borderRadius: 3,
		paddingLeft: 2, paddingRight: 2
	});
	
	lWin.add(password);
	
	confirm = Ti.UI.createTextField({
		hintText:L('confirm'),
		passwordMask: true,
		autocorrect: false,
		autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
		top:115,
		width: '90%',
		height: 40,
		font: {
			fontWeight: 'normal',
			fontSize: '17'
		},
		textAlign: 'center',
		color: '#333',
		backgroundColor: '#ddd',
		borderRadius: 3,
		paddingLeft: 2, paddingRight: 2,
		visible: false
	});
	
	if (!isLoginAction) {
		lWin.add(confirm);		
	}
	
	function postActionCallback() {
		if(acs.isLoggedIn()) {
			Ti.API.info('Congratulations, you successfully logged in.');
			if (!isLoginAction) {
				try {
					acs.createUserPhotoCollection(acs.currentUser(), acs.currentUser().username + ' Gallery');	
				}
				catch (e) {
					alert(e.Message);
				}
			}
			lWin.close();
			cb();
		} else {
			alert('Oopsie, something went wrong.');
			loginButton.title = L('login');
			loginButton.enabled = true;
		}
	}
	
	// event listeners
	done.addEventListener('click', function() {
		if(isLoginAction) {
			acs.login(username.value, password.value, postActionCallback);
		} else {
			acs.createUser(username.value, password.value, postActionCallback);
		}
	});
	
	return lWin;
};

module.exports = LoginWindow;