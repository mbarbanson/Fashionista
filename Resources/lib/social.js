/**
 * @author MONIQUE BARBANSON
 */


var Contacts = require('lib/contacts');
var FB = require('lib/facebook');

function sharePhoto (photoBlob, thumbUrl, message) {
	"use strict";
	//var message = "Checkout this cool iPhone app that makes shopping more fun";
	//FIXME move this behind a button
	//Contacts.testContacts();
	//FIXME move this behind a button
	// log into facebook and link to external account on success
	FB.authorize();
	
	// post to wall
	FB.postPhoto(photoBlob, thumbUrl, message);
	// call this to login with facebook instead of having fashionista specific credentials
	//FB.linktoFBAccount();
}


function chooseFBFriends () {
	"use strict";
	// log into facebook and link to external account unless we already have a valid access token
	FB.authorize();
	
	// get full list of FB friends
	FB.getFriendsList();
	// call this to login with facebook instead of having fashionista specific credentials
	//FB.linktoFBAccount();
}


function findFBFriends (callback) {
	"use strict";
	// log into facebook and link to external account unless we already have a valid access token
	FB.authorize();
	
	Cloud.SocialIntegrations.searchFacebookFriends(function (e){
	    if (e.success) {
	        if (e.users) {
	        	Ti.API.info('Success:\\n' +
	            	'Count: ' + e.users.length);
	           }
	        else {
	        	Ti.API.info("Current user doesn;t have any friends using on Fashionista");
	        }
	        for (var i = 0; i < e.users.length; i++) {
	            var user = e.users[i];
	            Ti.API.info('id: ' + user.id + '\\n' +
	                'first name: ' + user.first_name + '\\n' +
	                'last name: ' + user.last_name);
	         }
	         return callback (e.users);
	    } else {
	        alert('Error:\\n' +
	            ((e.error && e.message) || JSON.stringify(e)));
            return null;
	    }
	});	
}


exports.sharePhoto = sharePhoto;
exports.chooseFBFriends = chooseFBFriends;
exports.findFBFriends = findFBFriends;
