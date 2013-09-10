/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */


(function () {
	'use strict';
	var acs,
		Notifications,
		Flurry;
	acs = require('lib/acs');
	Notifications = require('ui/common/notifications');
	Flurry = require('sg.flurry');		
						
	function createLoginWindow(action, cb, containingTab) {
		var isLoginAction, 
			dialogHeight, 
			lWin, 
			done,
			signInBtn,
			forgotPwdBtn, 
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
			backgroundColor: '#DDD',
			barColor: '#5D3879',
			//rightNavButton: done,
			title: Ti.Locale.getString(action + 'WinTitle'),
			tabBarHidden: true
		});
			
		username = Ti.UI.createTextField({
			hintText: Ti.Locale.getString('username'),
			autocorrect: false,
			autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
			returnKeyType: Ti.UI.RETURNKEY_NEXT,			
			top:25,
			width: '90%',
			height: 40,
			font: {
				fontWeight: 'normal',
				fontSize: '17'
			},
			textAlign: 'center',
			color: '#333',
			backgroundColor: '#FFF',
			borderRadius: 3,
			paddingLeft: 2, paddingRight: 2
		});
		
		lWin.add(username);
		username.addEventListener('return', function()
		{
			username.value.toLowerCase();
			// validate username here
			password.focus();
		});
		
		password = Ti.UI.createTextField({
			hintText: Ti.Locale.getString('password'),
			passwordMask: true,
			autocorrect: false,
			autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
//			keyboardType: Ti.UI.KEYBOARD_EMAIL,
			returnKeyType: Ti.UI.RETURNKEY_DONE,
			top:70, 
			width: '90%',
			height: 40,
			font: {
				fontWeight: 'normal',
				fontSize: '17'
			},
			textAlign: 'center',
			color: '#333',
			backgroundColor: '#FFF',
			borderRadius: 3,
			paddingLeft: 2, paddingRight: 2
		});

		signInBtn = Titanium.UI.createButton({
			title: Ti.Locale.getString(action),
			style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
			backgroundColor: '#5D3879',
			color: 'white',
			width: '44%',
			height: '8%',
			left: '28%',
			top: 140 
		});
		

				
		if (!isLoginAction)	{
			signInBtn.setTop(185);
			password.setReturnKeyType(Ti.UI.RETURNKEY_DONE);
			password.addEventListener('return', function()
			{
				email.focus();
			});			
			email = Ti.UI.createTextField({
				hintText: Ti.Locale.getString('email'),
				autocorrect: false,
				autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
				returnKeyType: Ti.UI.RETURNKEY_DONE,				
				top:115,
				width: '90%',
				height: 40,
				font: {
					fontWeight: 'normal',
					fontSize: '17'
				},
				textAlign: 'center',
				color: '#333',
				backgroundColor: '#FFF',
				borderRadius: 3,
				paddingLeft: 2, paddingRight: 2
			});
			email.addEventListener('return', function()
			{
				done.fireEvent('click');
			});			
			
			lWin.add(email);
						
		}
		else {
			forgotPwdBtn = Titanium.UI.createButton({
				title: Ti.Locale.getString('forgotPassword'),
				style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
				backgroundColor: 'transparent',
				color: '#3366BB',
				textAlign: 'right',
				font: {
					fontWeight: 'normal',
					fontSize: '10'
				},				
				width: '40%',
				height: 12,
				left: '55%',
				top: 115 
			});	
			lWin.add(forgotPwdBtn);
			
			forgotPwdBtn.addEventListener('click', function () {
				var ResetWindow = require('ui/common/ResetWindow'),
					resetWindow = ResetWindow.createResetWindow();
				if (resetWindow) {
					containingTab.open(resetWindow);
				}				
			});
						
			password.addEventListener('return', function()
			{
				done.fireEvent('click');
			});			
		}
		
		lWin.add(signInBtn);		
		
		signInBtn.addEventListener('click', function() {
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
			var currentUser = acs.currentUser();
			if(currentUser) {
				Ti.API.info('Congratulations, you successfully logged in.');
				Flurry.logEvent('signupOrloginSuccess', { 'username': currentUser.username});						
				cb();
				spinner.hide();
				lWin.remove(spinner);
				lWin.close();
			}
		}
		
		function errorCallback(e) {
			Ti.API.info('login or createUser failed:' + e.message);
			spinner.hide();
			lWin.remove(spinner);
			done.setEnabled(true);
			Flurry.logEvent('signupOrloginError', { 'username': username.text });						
		}
		
		// event listeners
		done.addEventListener('click', function() {
			if(isLoginAction) {				
				acs.login(username.value, password.value, postActionCallback, errorCallback);
			} else {
				var emailAddy = email.value;
				if (!validateEmail(emailAddy)) {
					alert(Ti.Locale.getString('malformedEmail'));
					return;
				}
				// avoid repeat click on done
				done.setEnabled(false);
				acs.createUser(username.value, email.value, password.value, postActionCallback, errorCallback);
				//acs.sendWelcome(email.value, successCallback, errorCallback);
			}
			lWin.add(spinner);
			spinner.show();						
		});
		
		return lWin;
	}
	exports.createLoginWindow = createLoginWindow;	
} ());


