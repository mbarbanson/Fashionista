/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */



/*
 * 
function checkemail(emailAddress) {
        var str = emailAddress;
        var filter = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (filter.test(str)) {
            testresults = true;
        } else {
            testresults = false;
        }
        return (testresults);
};
 */

(function () {
	'use strict';
	var acs,
		emails,
		Notifications,
		Flurry;
	acs = require('lib/acs');
	emails = require('lib/emails');
	Notifications = require('ui/common/notifications');
	Flurry = require('sg.flurry');		
						
	function createResetWindow() {
		var win, 
			resetBtn,
			email,
			spinner = Ti.UI.createActivityIndicator({top:'50%', left: '50%'}),
			style,
			validateEmail, successCallback, errorCallback;

		//setup spinny activity indicator
		style = Ti.App.darkSpinner;			
		spinner.font = {fontFamily:'Helvetica Neue', fontSize:15, fontWeight:'bold'};
		spinner.style = style;				
		
		win = Ti.UI.createWindow({
			backgroundColor: '#DDD',
			barColor: '#5D3879',
			title: Ti.Locale.getString('resetPasswordWinTitle'),
			tabBarHidden: true
		});
		
		email = Ti.UI.createTextField({
			hintText: Ti.Locale.getString('email'),
			autocorrect: false,
			autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
			returnKeyType: Ti.UI.RETURNKEY_DONE,				
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
	
		resetBtn = Titanium.UI.createButton({
			title: Ti.Locale.getString('reset'),
			style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
			backgroundColor: '#5D3879',
			color: 'white',
			width: '30%',
			height: '8%',
			left: '35%',
			top: 100 
		});		
		
		
		email.addEventListener('return', function()
		{
			resetBtn.fireEvent('click');
		});
				
		win.add(email);
		win.add(resetBtn);

		validateEmail = function (email) {
			/*jslint regexp: true */
			var re = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;			
			//var re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/;
		    return re.test(email);
		};
		
		successCallback = function (e) {
			Ti.API.info('reset password link sent.');
			//callback();
			//spinner.hide();
			//win.remove(spinner);
			win.close();
			alert(Ti.Locale.getString('resetLinkSent'));
		};
		
		errorCallback = function (e) {
			//Ti.API.info('resetPassword failed:' + e.message);
			spinner.hide();
			win.remove(spinner);
			resetBtn.setEnabled(true);
			alert(Ti.Locale.getString(e.message));						
		};
		
		// event listeners
		resetBtn.addEventListener('click', function() {
			var emailAddy = email.value;
			if (!validateEmail(emailAddy)) {
				alert(Ti.Locale.getString('malformedEmail'));
				return;
			}
			// avoid repeat click on done
			resetBtn.setEnabled(false);
			emails.sendResetPasswordLink(emailAddy, successCallback, errorCallback);
			win.add(spinner);
			spinner.show();						
		});
		
		return win;
	}
	
	exports.createResetWindow = createResetWindow;	
} ());

