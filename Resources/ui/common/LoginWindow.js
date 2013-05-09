/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
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
			lwDialog, 
			username,
			email, 
			password, 
			confirm,
			spinner = Ti.UI.createActivityIndicator({top:'50%', left: '50%'}),
			style;
			
		//setup spinny activity indicator
		style = Ti.App.darkSpinner;			
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
			title: Ti.Locale.getString(action),
			tabBarHidden: true
		});
		
		//FIXME not used
		winTitle = Titanium.UI.createButton({
			color: 'white',	
			focusable: false,
			enabled: true,
			title: Ti.Locale.getString(action),
			font: {fontFamily: 'Thonburi', fontsize: 14},
			style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN
		});
			
		username = Ti.UI.createTextField({
			hintText: Ti.Locale.getString('username'),
			autocorrect: false,
			autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
			top:25, //70,
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
			hintText: Ti.Locale.getString('password'),
			passwordMask: true,
			autocorrect: false,
			autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
			keyboardType: Ti.UI.KEYBOARD_EMAIL,
			returnKeyType: Ti.UI.RETURNKEY_DONE,
			top:70, //115,
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
		
		if (!isLoginAction)	{
			email = Ti.UI.createTextField({
				hintText: Ti.Locale.getString('email'),
				autocorrect: false,
				autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
				top:115, //25,
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
			
			lWin.add(email);			
		}
		
		
		
		password.addEventListener('return', function()
		{
			done.fireEvent('click');
		});
		
		lWin.add(password);


		function validateEmail(email) {
			/*jslint regexp: true */
			var re = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;			
			//var re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/;
		    return re.test(email);
		}
		
		function postActionCallback(e) {
			if(e.success && acs.currentUser()) {
				Ti.API.info('Congratulations, you successfully logged in.');
				cb();
				spinner.hide();
				lWin.remove(spinner);
				lWin.close();
			} else {
				Ti.API.info('login or createUser failed:' + e.message);
				spinner.hide();
				lWin.remove(spinner);
			}
		}
		
		function errorCallback(e) {
			Ti.API.info('login or createUser failed:' + e.message);
			spinner.hide();
			lWin.remove(spinner);			
		}
		
		// event listeners
		done.addEventListener('click', function() {
			if(isLoginAction) {
				acs.login(username.value, password.value, postActionCallback);
			} else {
				var emailAddy = email.value;
				if (!validateEmail(emailAddy)) {
					alert(Ti.Locale.getString('malformedEmail'));
					return;
				}				
				acs.createUser(username.value, email.value, password.value, postActionCallback, errorCallback);
			}
			lWin.add(spinner);
			spinner.show();			
		});
		
		return lWin;
	}
	exports.createLoginWindow = createLoginWindow;	
} ());

