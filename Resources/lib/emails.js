/**
 * @author MONIQUE BARBANSON
 */

( function (){
	'use strict';
	var Cloud = require('ti.cloud');
		
// email
/*
function sendEmailNotification(template, toEmail, caption, successCallback, errorCallback) {
	var Flurry = require('sg.flurry'),
		user = currentUser(),
		username = user.username;
	
	Flurry.logEvent('Cloud.Emails.send', { 'user': username, 'to': toEmail, 'caption': caption });		
	Cloud.Emails.send({
	    template: template,
		recipients: toEmail,
		from: user.email,
		username: username,
		caption: caption
	}, function (e) {
	    if (e.success) {
	        if (successCallback) { successCallback(e); }
			//Flurry.logEvent('welcomeEmailSuccess', { 'email': email.value});						
		} else {
		    Ti.API.info('Error:\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
		    }
			Flurry.logEvent('EmailError', {'user': username, 'to': toEmail, 'caption': caption });
			if (errorCallback) { 
				errorCallback(e); 
			}
		});	
}*/


	
	
	function sendWelcome(email, successCallback, errorCallback) {
		var Flurry = require('sg.flurry');
		
		Flurry.logEvent('Cloud.Emails.send', { 'email': email.value });		
		Cloud.Emails.send({
		    template: 'welcome',
			recipients: email
		}, function (e) {
		    if (e.success) {
		        if (successCallback) { successCallback(e); }
				Flurry.logEvent('welcomeEmailSuccess', { 'email': email.value});						
			} else {
			    Ti.API.info('Error:\n' +
			            ((e.error && e.message) || JSON.stringify(e)));
			    }
				Flurry.logEvent('welcomeEmailError', { 'email': email.value });
				if (errorCallback) { 
					errorCallback(e); 
				}
			});
	}
	
	
	
	function sendResetPasswordLink(email, successCallback, errorCallback) {
		var Flurry = require('sg.flurry');
		
		Flurry.logEvent('Cloud.Users.sendResetPasswordLink', { 'email': email });
		Cloud.Users.requestResetPassword({
		    template: 'resetPassword',
			email: email
		}, function (e) {
		    if (e.success) {
		        if (successCallback) { 
					successCallback(e);
				}
				Flurry.logEvent('resetPasswordSuccess', { 'email': email});						
			} else {
			    Ti.API.info('Error:\n' +
			            ((e.error && e.message) || JSON.stringify(e)));
				Flurry.logEvent('resetPasswordError', { 'email': email });
				if (errorCallback) { 
					errorCallback(e); 
				}
			}
		});
	}
	

	function sendNewActivityEmail(template, recipients, caption, successCallback, errorCallback){
		var Flurry = require('sg.flurry'),
			acs = require('lib/acs'),
			user = acs.currentUser(),
			username = user.username,
			toEmails;
		// replace array of users with array of email addresses
		recipients = recipients.map(function(user) { if (user) { return user.email;}});
		// filter out null emails and self
		recipients = recipients.filter(function(email) {if (email && email !== user.email) {return email;}});
		toEmails = (recipients  && recipients.length > 0 ) ? recipients.join() : null;
		
		Flurry.logEvent('Cloud.Emails.send', { 'user': username, 'to': toEmails, 'caption': caption });		
		if (toEmails) {
			Cloud.Emails.send({
			    template: template,
				recipients: toEmails,
				from: user.email,
				username: username,
				caption: caption
			}, function (e) {
			    if (e.success) {
			        if (successCallback) { successCallback(e); }
					//Flurry.logEvent('welcomeEmailSuccess', { 'email': email.value});						
				} else {
				    Ti.API.info('Error:\n' +
				            ((e.error && e.message) || JSON.stringify(e)));
				    }
					Flurry.logEvent('EmailError', {'user': username, 'to': toEmails, 'caption': caption });
					if (errorCallback) { 
						errorCallback(e); 
					}
				});				
		}
	}


	function sendNewActivityToAllFriends(template, caption, successCallback, errorCallback) {
		var acs = require('lib/acs'),
			Flurry = require('sg.Flurry'),
			currentUserId = acs.currentUserId();
		acs.getFriendsList(function (friends) {
						sendNewActivityEmail(template, friends, caption, successCallback, errorCallback);
				},
		function () {
			Ti.API.error("not calling sendNewActivityEmail since getFriendsList got an error");
			Flurry.logEvent('SendMessageToAllFriendsError');	
		});	
	}

	exports.sendNewActivityToAllFriends = sendNewActivityToAllFriends;
	exports.sendResetPasswordLink = sendResetPasswordLink;
	exports.sendNewActivityEmail = sendNewActivityEmail;	
}());
