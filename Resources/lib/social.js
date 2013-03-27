/*
 * @author MONIQUE BARBANSON
 */

(function () {
	'use strict';
	var Contacts = require('lib/contacts'),
		FB = require('lib/facebook'),
		Cloud = require('ti.cloud'),
		acs = require('lib/acs');
	
	function sharePhototoFB (photoBlob, message) {

		//var message = "Checkout this cool iPhone app that makes shopping more fun";
		//FIXME move this behind a button
		//Contacts.testContacts();
		//FIXME move this behind a button
		// log into facebook and link to external account on success
		FB.authorize(function (e) {FB.postPhoto(photoBlob, message);});
		
		// call this to login with facebook instead of having fashionist specific credentials
		//FB.linktoFBAccount();
	}
	
	
	
	function newPostNotification (post) {
		Ti.API.info('social.newPostNotification');
		acs.newPostNotification(post);
	}
	
	
	function newCommentNotification (post, commentText) {
		Ti.API.info('social.newCommentNotification');
		acs.newCommentNotification(post, commentText);
	}
	
	
	function newLikeNotification (post) {
		Ti.API.info('social.newLikeNotification');
		acs.newLikeNotification(post);
	}


	function chooseFBFriends () {
		FB.authorize(function (e) {FB.getAllFBFriends();});
	}
	
	
	function findFBFriends (callback) {
		var Facebook = require('lib/facebook'),
			i;
		Cloud.SocialIntegrations.searchFacebookFriends(function (e){
		    if (e.success) {
		        if (e.users) {
					Ti.API.info('Success:\\n' + 'Count: ' + e.users.length);
		           }
		        else {
					Ti.API.info("Current user doesn't have any friends using on Fashionist");
		        }
		        for (i = 0; i < e.users.length; i = i + 1) {
		            var user = e.users[i];
		            Ti.API.info('id: ' + user.id + '\\n' +
		                'first name: ' + user.first_name + '\\n' +
		                'last name: ' + user.last_name);
		         }
		         callback (e.users);
		    } else {
		        Ti.API.info('searchFacebookFriends error:\\n' +
		            ((e.error && e.message) || JSON.stringify(e)));
				if (Facebook.hasLinkedFBAccount()) {
					Ti.API.info("unlink facebook account and log out of Facebook to reset facebook token");			
					Facebook.unlinkFBAccount(function () {if (Ti.Facebook.getLoggedIn()) {Facebook.logout();}});	
				}
				else {
					Ti.Facebook.setloggedIn(false);
					Ti.Facebook.setUid(null);
					Ti.Facebook.authorize();
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

