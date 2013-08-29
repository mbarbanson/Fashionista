/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */

(function () {
	'use strict';
	var Contacts = require('lib/contacts'),
		Cloud = require('ti.cloud'),
		acs = require('lib/acs');
	
	function sharePhototoFB (photoBlob, message) {
		var FB = require('lib/facebook');
		//var message = "Checkout this cool iPhone app that makes shopping more fun";
		//FIXME move this behind a button
		//Contacts.fashionistContacts();
		//FIXME move this behind a button
		// log into facebook and link to external account on success
		FB.authorize(function (e) {FB.postPhoto(photoBlob, message);});
		
		// call this to login with facebook instead of having fashionist specific credentials
		//FB.linktoFBAccount();
	}
	
	
	
	function newPostNotification (post, notifyAllFriends) {
		Ti.API.info('social.newPostNotification');
		acs.newPostNotification(post, notifyAllFriends);
	}
	
	
	function newCommentNotification (post, commentText, otherComments) {
		Ti.API.info('social.newCommentNotification');
		acs.newCommentNotification(post, commentText, otherComments);
	}
	
	
	function newLikeNotification (post) {
		Ti.API.info('social.newLikeNotification');
		acs.newLikeNotification(post);
	}


	function chooseFBFriends () {
		var FB = require('lib/facebook');
		FB.authorize(function (e) {FB.getAllFBFriends();});
	}
	
	
	function findFBFriends (successCallback, errorCallback) {
		var facebook = require('facebook'),
			FB = require('lib/facebook'),
			i;
		Cloud.SocialIntegrations.searchFacebookFriends(function (e) {
		    if (e.success) {
		        if (e.users) {
					Ti.API.info('Success:\\n' + 'Count: ' + e.users.length);
		           }
		        else {
					Ti.API.info("Current user doesn't have any friends using Fashionist");
		        }
		        for (i = 0; i < e.users.length; i = i + 1) {
		            var user = e.users[i];
		            Ti.API.info('id: ' + user.id + '\\n' +
		                'first name: ' + user.first_name + '\\n' +
		                'last name: ' + user.last_name);
		         }
		         successCallback (e.users);
		    } else {
		        Ti.API.info('searchFacebookFriends error:\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
				if (FB.hasLinkedFBAccount()) {
					Ti.API.info("unlink facebook account and log out of Facebook to reset facebook token");			
					FB.unlinkFBAccount(function () {if (facebook.getLoggedIn()) {FB.logout();}});	
				}
				else {
					if (facebook.getLoggedIn()) { 
						facebook.logout(); 
					}
					facebook.authorize();
				}			       
		    }
		});	
	}
	
	// exported functions
	exports.newPostNotification = newPostNotification;
	exports.newCommentNotification = newCommentNotification;
	exports.newLikeNotification = newLikeNotification;	
	exports.chooseFBFriends = chooseFBFriends;
	exports.findFBFriends = findFBFriends;
} ());

