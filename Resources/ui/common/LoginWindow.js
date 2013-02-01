/*
	UI component: Login / Create user dialog
*/


(function () {
	'use strict';
	var acs,
		Notifications;
	acs = require('lib/acs');
	Notifications = require('ui/common/notifications');
		
						
	function createLoginWindow(action, cb) {
		var isLoginAction, 
			dialogHeight, 
			lWin, 
			done, 
			winTitle, 
			flexSpace, 
			lwDialog, 
			username, 
			password, 
			confirm,
			spinner = Ti.UI.createActivityIndicator({top:'50%', left: '50%'}),
			style;
			
		//setup spinny activity indicator
		if (Ti.Platform.name === 'iPhone OS'){
			style = Ti.UI.iPhone.ActivityIndicatorStyle.DARK;
		}
		else {
			style = Ti.UI.ActivityIndicatorStyle.BIG_DARK;				
		}			
		spinner.font = {fontFamily:'Helvetica Neue', fontSize:15,fontWeight:'bold'};
		spinner.style = style;	
				
		isLoginAction = (action === 'login');
			
		done = Titanium.UI.createButton({
			systemButton: Titanium.UI.iPhone.SystemButton.DONE
		});
		
		lWin = Ti.UI.createWindow({
			backgroundColor: 'white',
			barColor: '#5D3879',
			rightNavButton: done,
			title: L(action),
			tabBarHidden: true
		});
		
		//FIXME not used
		winTitle = Titanium.UI.createButton({
			color: 'white',	
			focusable: false,
			enabled: true,
			title: L(action),
			font: {fontFamily: 'Thonburi', fontsize: 14},
			style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN
		});
		//FIXME not used. remove 	    
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
		
		//FIXME: currently not visible.
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

				var photoCollectionId = acs.getPhotoCollectionId(acs.currentUser());
				
				if (!isLoginAction) { // create user
					try {
						acs.createUserPhotoCollection(acs.currentUser(), acs.currentUser().username + ' Gallery');	
					}
					catch (e) {
						alert("Called createUserPhotoCollection " + e.Message);
					}
				}
				else if (!photoCollectionId){ // login user
					try {
						acs.getUserPhotoCollection();	
					}
					catch (e2) {
						alert("Called getUserPhotoCollection " + e2.Message);
					}	
				}

				cb();
				spinner.hide();
				lWin.remove(spinner);
				lWin.close();
			} else {
				alert('Oopsie, something went wrong.');
			}
		}
		
		// event listeners
		done.addEventListener('click', function() {
			// activityIndicator must be added to the window
			lWin.add(spinner);
			spinner.show();
			if(isLoginAction) {
				acs.login(username.value, password.value, postActionCallback);
			} else {
				acs.createUser(username.value, password.value, postActionCallback);
			}
		});
		
		return lWin;
	}
	exports.createLoginWindow = createLoginWindow;	
} ());

