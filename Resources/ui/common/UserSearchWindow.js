/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 **/



(function () {
	'use strict';

	function validateEmail(email) {
		/*jslint regexp: true */
		var re = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;			
		//var re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/;
	    return re.test(email);
	}
						
	function createUserSearchWindow(successCallback, errorCallback) {
		var win, scrollView,
			searchBtn, 
			username,
			email, 
			firstName, lastName,
			searchByUsernameLabel, searchByNameLabel, searchByEmailLabel,
			minInfoLabel, 
			spinner = Ti.UI.createActivityIndicator({top:'50%', left: '50%'}),
			style,
			wrappedErrorCallback = function (e) {
				var dialog;
				if (errorCallback) { errorCallback(e); }
				Ti.API.info('user search failed:' + e.message);
				spinner.hide();
				win.remove(spinner);
				dialog = Ti.UI.createAlertDialog({
					title: Ti.Locale.getString('fashionista'),
					message: Ti.Locale.getString('userSearchError')
				});
				dialog.show();						
			},
			wrappedSuccessCallback = function (users, query) {
				var dialog;
				Ti.API.info('User search success');
				spinner.hide();
				win.remove(spinner);
				// if matches where found, close the search window and create the results window
				if (users && users.length > 0) {
					win.close();
					if (successCallback) { 
						successCallback(users, query); 
					}					
				}
				else {
					dialog = Ti.UI.createAlertDialog({
						title: Ti.Locale.getString('fashionista'),
						message: Ti.Locale.getString('noMatchFound')
					});
					dialog.show();					
				}			
			};
			
		//setup spinny activity indicator
		style = Ti.App.darkSpinner;			
		spinner.font = {fontFamily:'Helvetica Neue', fontSize:15,fontWeight:'bold'};
		spinner.style = style;	
			
		searchBtn = Titanium.UI.createButton({
						title: Ti.Locale.getString('search'),
					    style : Ti.UI.iPhone.SystemButtonStyle.DONE
					});
		
		win = Ti.UI.createWindow({
	        statusBarStyle: Ti.UI.iPhone.StatusBar.LIGHT_CONTENT,
	        extendEdges: [Ti.UI.EXTEND_EDGE_LEFT, Ti.UI.EXTEND_EDGE_RIGHT],			
			backgroundColor: 'white',
			rightNavButton: searchBtn,
			title: Ti.Locale.getString('userSearchTitle'),
			tabBarHidden: true
		});
		
		scrollView = Ti.UI.createScrollView({
		  contentWidth: Ti.UI.SIZE,
		  contentHeight: Ti.UI.SIZE,
		  showVerticalScrollIndicator: true,
		  showHorizontalScrollIndicator: false,
		  top: 0,
		  height: '70%',
		  width: '100%'
		});
		
		searchByUsernameLabel = Ti.UI.createLabel({
			text : Ti.Locale.getString('searchByUsername'),
			textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
			verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
			wordWrap : true,
			color : 'black',
			top : 25,
			left : '5%',
			height : 20,
			width : '90%',
			paddingLeft : 2,
			paddingRight : 2,
			font : {
				fontWeight : 'bold',
				fontSize : '17'
			}
		});
		scrollView.add(searchByUsernameLabel);
					
		username = Ti.UI.createTextField({
			hintText: Ti.Locale.getString('username'),
			autocorrect: false,
			autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
			keyboardType: Ti.UI.KEYBOARD_EMAIL,
			returnKeyType: Ti.UI.RETURNKEY_SEARCH,			
			top:50, //70,
			left: '5%',
			width: '90%',
			height: 40,
			font: {
				fontWeight: 'normal',
				fontSize: '17'
			},
			textAlign: 'left',
			color: '#333',
			backgroundColor: '#ddd',
			borderRadius: 3,
			paddingLeft: 2, paddingRight: 2
		});
		
		scrollView.add(username);
		
		username.addEventListener('return', function()
		{
			if (username.value) {
				searchBtn.fireEvent('click');				
			}		
		});
		
		searchByNameLabel = Ti.UI.createLabel({
			text : Ti.Locale.getString('searchByName'),
			textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
			verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
			wordWrap : true,
			color : 'black',
			top : 110,
			left : '5%',
			height : 20,
			width : '90%',
			paddingLeft : 2,
			paddingRight : 2,
			font : {
				fontWeight : 'bold',
				fontSize : '17'
			}
		});
		scrollView.add(searchByNameLabel);

		firstName = Ti.UI.createTextField({
			hintText: Ti.Locale.getString('firstName'),
			autocorrect: false,
			autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
			keyboardType: Ti.UI.KEYBOARD_EMAIL,
			returnKeyType: Ti.UI.RETURNKEY_DONE,
			top:135, //115,
			left: '5%',
			width: '43%',
			height: 40,
			font: {
				fontWeight: 'normal',
				fontSize: '17'
			},
			textAlign: 'left',
			color: '#333',
			backgroundColor: '#ddd',
			borderRadius: 3,
			paddingLeft: 2, paddingRight: 2
		});
		
		
		lastName = Ti.UI.createTextField({
			hintText: Ti.Locale.getString('lastName'),
			autocorrect: false,
			autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
			keyboardType: Ti.UI.KEYBOARD_EMAIL,
			returnKeyType: Ti.UI.RETURNKEY_SEARCH,
			top:135, //115,
			left: '50%', 
			width: '45%',
			height: 40,
			font: {
				fontWeight: 'normal',
				fontSize: '17'
			},
			textAlign: 'left',
			color: '#333',
			backgroundColor: '#ddd',
			borderRadius: 3,
			paddingLeft: 2, paddingRight: 2
		});
		scrollView.add(firstName);
		scrollView.add(lastName);
		
		lastName.addEventListener('return', function()
		{
			if (firstName.value && lastName.value) {
				searchBtn.fireEvent('click');	
			}
			else if (!firstName.value) {
				firstName.focus();	
			}
			else if (!lastName.value) {
				lastName.focus();	
			}		
		});
		

		searchByEmailLabel = Ti.UI.createLabel({
			text : Ti.Locale.getString('searchByEmail'),
			textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
			verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
			wordWrap : true,
			color : 'black',
			top : 195,
			left : '5%',
			height : 20,
			width : '90%',
			paddingLeft : 2,
			paddingRight : 2,
			font : {
				fontWeight : 'bold',
				fontSize : '17'
			}
		});
		scrollView.add(searchByEmailLabel);
				
		email = Ti.UI.createTextField({
			hintText: Ti.Locale.getString('email'),
			autocorrect: false,
			autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
			keyboardType: Ti.UI.KEYBOARD_EMAIL,
			returnKeyType: Ti.UI.RETURNKEY_SEARCH,			
			top: 220,
			left: '5%',
			width: '90%',
			height: 40,
			font: {
				fontWeight: 'normal',
				fontSize: '17'
			},
			textAlign: 'left',
			color: '#333',
			backgroundColor: '#ddd',
			borderRadius: 3,
			paddingLeft: 2, paddingRight: 2
		});
		
		scrollView.add(email);
		
		email.addEventListener('return', function()
		{
			var emailAddy = email.value;
			if (!validateEmail(emailAddy)) {
				alert(Ti.Locale.getString('malformedEmail'));
				return;
			}
						
			searchBtn.fireEvent('click');		
		});
		
		minInfoLabel = Ti.UI.createLabel({
			text : Ti.Locale.getString('minInfoUserSearch'),
			textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
			verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
			wordWrap : true,
			color : 'black',
			bottom : '10%',
			left : '5%',
			height : 100,
			width : '90%',
			paddingLeft : 2,
			paddingRight : 2,
			font : {
				fontWeight : 'normal',
				fontSize : '14'
			}
		});
		win.add(minInfoLabel);
		
		
		// event listeners
		searchBtn.addEventListener('click', function(e) {
			var acs = require('lib/acs'),
				emailAddy = email.value,
				firstNameVal = firstName.value,
				lastNameVal = lastName.value,
				usernameVal = username.value,
				whereClause = [];
			// search by username	
			if (usernameVal) {
				whereClause.push({"username": usernameVal});	
			}
			// search by email address
			else if (emailAddy) {
				if (!validateEmail(emailAddy)) {
					alert(Ti.Locale.getString('malformedEmail'));
				}
				else {
					whereClause.push({"email": emailAddy});
				}
			}
			// search by first name and last name 
			else if (!firstNameVal)	{
				alert(Ti.Locale.getString('missingFullName'));
				firstName.focus();
			}
			else if (!lastNameVal) {
				alert(Ti.Locale.getString('missingFullName'));
				lastName.focus();			
			}
			else if (firstNameVal && lastNameVal) {
				whereClause.push({"first_name": firstNameVal});
				whereClause.push({"last_name": lastNameVal});
			}
			if (whereClause.length > 0) {
				if (whereClause.length === 1) {			
					acs.queryUsers(whereClause[0], wrappedSuccessCallback, wrappedErrorCallback, 1);
				}
				else if (whereClause.length > 1) {
					acs.queryUsers({"$or": whereClause}, wrappedSuccessCallback, wrappedErrorCallback, 1);
				}		
				win.add(spinner);
				spinner.show();					
			}		
		});
		
		win.add(scrollView);
		return win;
	}
	exports.createUserSearchWindow = createUserSearchWindow;	
} ());

