/*
	Library to wrap app-specific functionality around the Contacts API
*/

var performAddressBookFunction = function() {
	"use strict"; 
	Ti.API.info("performAddressBookFunction"); 
	var singleValue, multiValue, people, person, i, ilen, j, jlen;
	
	singleValue = [
	  'recordId', 'firstName', 'middleName', 'lastName', 'fullName', 'prefix', 'suffix', 
	  'nickname', 'firstPhonetic', 'middlePhonetic', 'lastPhonetic', 'organization', 
	  'jobTitle', 'department', 'note', 'birthday', 'created', 'modified', 'kind'
	];
	multiValue = [
	  'email', 'address', 'phone', 'instantMessage', 'relatedNames', 'date', 'url'
	];
	people = Ti.Contacts.getAllPeople();
	Ti.API.info('Total contacts: ' + people.length);
	for (i = 0, ilen = people.length; i<ilen; i = i + 1){
	  Ti.API.info('---------------------');
	  person = people[i];
	  for (j=0, jlen=singleValue.length; j < jlen; j = j + 1){
	    Ti.API.info(singleValue[j] + ': ' + person[singleValue[j]]);
	  }
	  for (j=0, jlen=multiValue.length; j<jlen; j = j + 1){
	    Ti.API.info(multiValue[j] + ': ' + JSON.stringify(person[multiValue[j]]));
	  }
	}
};

var addressBookDisallowed = function() {
	"use strict";
	 Ti.API.info("addressBookDisallowed"); 
};

function testContacts() {
	"use strict";
	if (Ti.Contacts.contactsAuthorization === Ti.Contacts.AUTHORIZATION_AUTHORIZED){
	    performAddressBookFunction();
	} else if (Ti.Contacts.contactsAuthorization === Ti.Contacts.AUTHORIZATION_UNKNOWN){
	    Ti.Contacts.requestAuthorization(function(e){
	        if (e.success) {
	            performAddressBookFunction();
	        } else {
	            addressBookDisallowed();
	        }
	    });
	} else {
	    addressBookDisallowed();
	}	
}


exports.testContacts = testContacts;