/**
 * copyright 2012-2013 by Monique Barbanson. All rights reserved.
 * @author MONIQUE BARBANSON
 * Contacts
 * 
 */


function requestContactsAccess(successCallback, errorCallback) {
	"use strict";

	var needsAuth = false,
		addressBookDisallowed, 
		performAddressBookFunction,
		win = null;
	
	if (Titanium.Platform.name === 'iPhone OS')
	{
		needsAuth = true;
	}
		
	Ti.API.info("Contacts Authorization is " + Ti.Contacts.contactsAuthorization);
		
	if (Ti.Contacts.contactsAuthorization === Ti.Contacts.AUTHORIZATION_AUTHORIZED){
		Ti.API.info("Contacts Authorization is AUTHORIZATION_AUTHORIZED. Calling successCallback directly");
	    successCallback();
	} else if (Ti.Contacts.contactsAuthorization === Ti.Contacts.AUTHORIZATION_UNKNOWN ||
				Ti.Contacts.contactsAuthorization === Ti.Contacts.AUTHORIZATION_DENIED ||
				Ti.Contacts.contactsAuthorization === Ti.Contacts.AUTHORIZATION_RESTRICTED){
		Ti.API.info("Contacts Authorization is AUTHORIZATION_UNKNOWN, AUTHORIZATION_DENIED or AUTHORIZATION_RESTRICTED. Calling requestAuthorization");
	    Ti.Contacts.requestAuthorization(function(e){
	        if (e.success) {
	            successCallback();
	        } else {
	            errorCallback();
	        }
	    });
	} else {
		Ti.API.info("Unknown Contacts Authorization value: " + Ti.Contacts.contactsAuthorization);
	    errorCallback();
	}
	return win;
}


/*
 * Once we're authorized to access the user's contact, get their list of contacts, generate a query to find which contacts match an existing user and 
 * make a call to the cloud to get the list of contacts who are fashionist users
 * 
 */
function findContactsOnFashionist(successCallback, errorCallback) {
	'use strict';
	var acs = require('lib/acs'),
		contacts = Ti.Contacts.getAllPeople(100),
		currentUser = acs.currentUser(),
		currentUserHasExtAccount = currentUser.external_accounts.length !== 0,
		whereClause = [],
		numContacts = Math.min(100, contacts.length), 
		usernames = [], emails = [],
		i, contact, contactQuery;
	Ti.API.info("Retrieved " + contacts.length + " contacts. NumContacts is " + numContacts);
	for (i = 0; i < numContacts; i = i + 1) {
		contact = contacts[i];
		contactQuery = [];
		// choose match names or emails to reduce the size of the where clause since ACS doesn't seem to be able to deal with long clauses
		// if current user has linked with facebook, use full name otherwise use email
		if (currentUserHasExtAccount && contact.firstName !== '' && contact.lastName !== '') {
			contactQuery.push({"first_name": contact.firstName, "last_name": contact.lastName});
		}
		// current user is not facebook linked, their friends are likely not either, so match on emails
		else if (!currentUserHasExtAccount && contact.email && contact.email.home) {
			contactQuery.push({"email": contact.email.home[0]});
		}
		//Ti.API.info('\ncontactQuery: ' + contactQuery);
		if (contactQuery.length === 2) {
			whereClause.push({"$or": contactQuery});
			//Ti.API.info('\nwhereClause: ' + '{ "$or": ' + contactQuery + '}');
		}
		else if (contactQuery.length === 1) {
			whereClause.push(contactQuery[0]);
			//Ti.API.info('\nwhereClause: ' + contactQuery[0]);
		}	
	}
	
	acs.queryUsers({"$or": whereClause}, successCallback, errorCallback, 1);	
}


exports.requestContactsAccess = requestContactsAccess;
exports.findContactsOnFashionist = findContactsOnFashionist;