/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */


(function () {
	'use strict';
	var privProfileInfo = {
			editedPhoto: null, editedBio: null, editedFirstName: null, editedLastName: null, 
			savedPhoto: null, savedBio: null, savedFirstName: null, savedLastName: null
	};
	
	function resetProfileChanges() {
		privProfileInfo.editedBio = null;
		privProfileInfo.editedFirstName = null;
		privProfileInfo.editedLastName = null;
		privProfileInfo.editedPhoto = null;
		privProfileInfo.savedPhoto = null;
		privProfileInfo.savedBio = null;
		privProfileInfo.savedFirstName = null;
		privProfileInfo.savedLastName = null;		
	}		
	

	
	function saveProfileChanges(user) {
		var acs = require('lib/acs'),
			customFields = {}, 
			isAvatarUpdated = false,
			isBioUpdated = false, 
			isFirstNameUpdated = false, 
			isLastNameUpdated = false,
			dict = {},
			hasChangedVisibly = false;
			
		if (!user) { return;}
				
		if (!user.custom_fields) {
			user.custom_fields = {};
		}				
		customFields = user.custom_fields;
		
		isAvatarUpdated = (user.photo && user.photo.processed && privProfileInfo.savedPhoto !== user.photo.urls.small_240);
		isBioUpdated = (privProfileInfo.editedBio && privProfileInfo.editedBio !== privProfileInfo.savedBio);
		isFirstNameUpdated = (privProfileInfo.editedFirstName && privProfileInfo.editedFirstName !== privProfileInfo.savedFirstName);
		isLastNameUpdated = (privProfileInfo.editedLastName && privProfileInfo.editedLastName !== privProfileInfo.savedLastName);
		
		if (isAvatarUpdated) {
			dict.photo_id = user.photo.id;
			hasChangedVisibly = true;
		}
		if (isBioUpdated) {
			customFields.bio = privProfileInfo.editedBio;
			dict.custom_fields = customFields;
		}
		if (isFirstNameUpdated) {
			user.first_name = privProfileInfo.editedFirstName;
			dict.first_name = user.first_name;
		}
		if (isLastNameUpdated) {
			user.last_name = privProfileInfo.editedLastName;
			dict.last_name = user.last_name;
		}
		if (isAvatarUpdated || isBioUpdated || isFirstNameUpdated || isLastNameUpdated) {
			acs.updateUser(dict);
			resetProfileChanges();
		}
		return hasChangedVisibly;	
	}
	
	
	function pickAvatarPicture(imgView, callback) {
		var ChangeAvatar = require('ui/common/ChangeAvatar'),
			newAvatar = ChangeAvatar.createChangePictureDialog(imgView, callback);
	}


	// the profile can only change for the current user. Don't pass user in as it may be stale
	function refreshUserProfile(profileView) {
		Ti.API.info("displaying user profile");		

		var acs = require('lib/acs'), 
			FB = require('lib/facebook'), 
			user = acs.currentUser(),
			ApplicationTabGroup = require('ui/common/ApplicationTabGroup'),
			IMG_BASE = 'https://github.com/appcelerator/titanium_mobile/raw/master/demos/KitchenSink/Resources/images/',		
			facebookUID, image,
			canEdit = (acs.currentUserId() === user.id);


		// custom user avatar (ie: not facebook avatar)
		if (user.photo && user.photo.processed) {
			image = user.photo.urls.small_240;
		}
		
		if (image) {
			privProfileInfo.savedPhoto = image;
		}
		else if (!image && user.external_accounts.length > 0) {
			facebookUID = FB.getLinkedFBId(user);
			image = 'https://graph.facebook.com/' + facebookUID + '/picture?width=200&height=200';
		}
		else {
			image = IMG_BASE + 'custom_tableview/user.png';
		}
		
		if (profileView.avatar) {
			profileView.avatar.image = image;			
		}

		if (profileView.bio && user.custom_fields) {
			profileView.bio.value = user.custom_fields.bio;			
		}
		
		//first name
		if (profileView.firstName) {
			profileView.firstName.value = user.first_name;
		}
		
		//last name
		if (profileView.lastName) {
			profileView.lastName.value = user.last_name;
		}

	}
	
	
	
	function doDisplayUserProfile(user, profileView) {
		Ti.API.info("displaying user profile");		

		var acs = require('lib/acs'), 
			FB = require('lib/facebook'), 
			ApplicationTabGroup = require('ui/common/ApplicationTabGroup'),
			IMG_BASE = 'https://github.com/appcelerator/titanium_mobile/raw/master/demos/KitchenSink/Resources/images/',		
			profileTable,
			photoBioRow, friendsRow, usernameRow, firstNameRow, lastNameRow,
			privateInfoLabel, emailRow, sexRow,
			avatarView, bioLabel, facebookUID, image,
			usernameLabel, usernameField, 
			firstNameLabel, firstNameField,
			lastNameLabel, lastNameField,
			canEdit = (acs.currentUserId() === user.id),
			bioFocusHandler = function(e) {
				bioLabel.editable = true;										
				if (e.source.value === bioLabel.privHintText) {
					e.source.value = "";
					e.source.color = 'black';
				}
			},
			bioBlurHandler = function(e) {
				bioLabel.editable = false;										
				if (e.source.value === "") {
					e.source.value = bioLabel.privHintText;
					e.source.color = '#aaa';
				}
			};

		if (!user.custom_fields) {
			user.custom_fields = {};
		}
		privProfileInfo.savedBio = user.custom_fields.bio;
		privProfileInfo.savedFirstName = user.first_name;
		privProfileInfo.savedLastName = user.last_name;	
		
		photoBioRow = Ti.UI.createTableViewRow({
			className : 'profileRow',
			backgroundColor : '#DDD',
			height : 110,
			left : 0,
			width: '100%'			
		});
		
		// custom user avatar (ie: not facebook avatar)
		if (user.photo && user.photo.processed) {
			image = user.photo.urls.small_240;
		}
		
		if (image) {
			privProfileInfo.savedPhoto = image;
		}
		else if (!image && user.external_accounts.length > 0) {
			facebookUID = FB.getLinkedFBId(user);
			image = 'https://graph.facebook.com/' + facebookUID + '/picture?height=160&width=160';
		}
		else {
			image = IMG_BASE + 'custom_tableview/user.png';
		}
		avatarView = Ti.UI.createImageView({
						image: image,
						bubbleParent: false,
						left: 5, top:0,
						width:100, height:100
						});
		avatarView.addEventListener('click', function (e) {
			var refreshCallback = function () {
				refreshUserProfile(profileView);
			};

			if (canEdit) {
				pickAvatarPicture(profileView, refreshCallback);				
			}
		});
		photoBioRow.add(avatarView);

		bioLabel = Ti.UI.createTextArea({
			value: privProfileInfo.savedBio,
			autolink: Ti.UI.AUTOLINK_URLS,			
			color: privProfileInfo.savedBio ? 'black' : '#aaa',
			bubbleParent: false,
			backgroundColor: '#FFF',
			returnKeyType: Ti.UI.RETURNKEY_DONE,
			textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
			autocapitalization : Titanium.UI.TEXT_AUTOCAPITALIZATION_SENTENCES,
			font : {
				fontWeight : 'normal',
				fontSize : '17'
			},						
			left: 110,
			top: 0,
			height: 100,
			visible: true
			});
		bioLabel.setWidth(Ti.App.SCREEN_WIDTH*0.96 - 110);
		bioLabel.setEditable(canEdit);
		photoBioRow.add(bioLabel);
		profileView.appendRow(photoBioRow);
		profileView.avatar = avatarView;
		profileView.bio = bioLabel;
		
		if (canEdit) {
			bioLabel.privHintText = Ti.Locale.getString('bioPrompt');
			bioLabel.value = privProfileInfo.savedBio || Ti.Locale.getString('bioPrompt');					
			bioLabel.addEventListener('focus', bioFocusHandler);
			bioLabel.addEventListener('selected', bioFocusHandler);
			bioLabel.addEventListener('singletap', bioFocusHandler);											
			bioLabel.addEventListener('blur', bioBlurHandler);					
			bioLabel.addEventListener('change', function (e){
				if (e.source.value !== "" && e.source.value !== bioLabel.privHintText) {
					privProfileInfo.editedBio = e.source.value;					
				}	
			});		
		}

		//username
		usernameRow = Ti.UI.createTableViewRow({
			className : 'profileRow',
			color : 'black',
			backgroundColor : '#DDD',		
			height : 50,
			left : 0,
			width: '100%',
			layout: 'absolute'
		});
		
		usernameLabel = Ti.UI.createLabel({
			text: Ti.Locale.getString('username'),
			color: 'black', 
			background: '#DDD',
			textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
			font : {
				fontWeight : 'normal',
				fontSize : '17'
			},						
			left: 5,
			top: '10%',
			height: '80%',
			width: 100,
			visible: true
			});
			
		
		usernameField = Ti.UI.createTextArea({
			value: user.username,
			editable: false,
			color: 'black', 
			background: 'white',
			textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
			returnKeyType: Ti.UI.RETURNKEY_DONE,			
			autocapitalization : Titanium.UI.TEXT_AUTOCAPITALIZATION_SENTENCES,
			font : {
				fontWeight : 'normal',
				fontSize : '17'
			},						
			left: 110,
			top: '10%',
			height: '80%',
			width: Ti.App.SCREEN_WIDTH*0.96- 110,
			visible: true
			});
		// username shouldn't be editable without checking the new username is available			
		//usernameField.setEditable(canEdit);
		usernameRow.add(usernameLabel);
		usernameRow.add(usernameField);
		profileView.appendRow(usernameRow);		
		
		//first name
		firstNameRow = Ti.UI.createTableViewRow({
			className : 'profileRow',
			color : 'black',
			backgroundColor : '#DDD',		
			height : 50,
			left : 0,
			width: '100%'
		});
		
		firstNameLabel = Ti.UI.createLabel({
			text: Ti.Locale.getString('firstName'),
			color: 'black', 
			background: '#DDD',
			textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
			font : {
				fontWeight : 'normal',
				fontSize : '17'
			},						
			left: 5,
			top: '10%',
			height: '80%',
			width: 100,
			visible: true
			});
			
		firstNameField = Ti.UI.createTextArea({
			value: privProfileInfo.savedFirstName,
			color: 'black', 
			background: 'white',
			textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
			returnKeyType: Ti.UI.RETURNKEY_DONE,			
			autocapitalization : Titanium.UI.TEXT_AUTOCAPITALIZATION_SENTENCES,
			//borderColor: '#888',
			//borderWidth: 1,
			//borderRadius : 1,
			font : {
				fontWeight : 'normal',
				fontSize : '17'
			},						
			left: 110,
			top: '10%',
			height: '80%',
			width: Ti.App.SCREEN_WIDTH*0.96- 110,
			visible: true
			});
			
			
		firstNameField.setEditable(canEdit);
		firstNameField.addEventListener('change', function (e) {
					privProfileInfo.editedFirstName = e.source.value;
		});		
		firstNameRow.add(firstNameLabel);
		firstNameRow.add(firstNameField);		
		profileView.appendRow(firstNameRow);
		profileView.firstName = firstNameField;		
		
		//last name
		lastNameRow = Ti.UI.createTableViewRow({
			className : 'profileRow',
			color : 'black',
			backgroundColor : '#DDD',	
			height : 50,
			left : 0,
			width: '100%'
		});
		
		lastNameLabel = Ti.UI.createLabel({
			text: Ti.Locale.getString('lastName'),
			color: 'black', 
			background: '#DDD',
			textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
			font : {
				fontWeight : 'normal',
				fontSize : '17'
			},						
			left: 5,
			top: '10%',
			height: '80%',
			width: 100,
			visible: true
			});
			
		lastNameField = Ti.UI.createTextArea({
			value: privProfileInfo.savedLastName,
			color: 'black', 
			background: '#FFF',
			textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
			returnKeyType: Ti.UI.RETURNKEY_DONE,			
			autocapitalization : Titanium.UI.TEXT_AUTOCAPITALIZATION_SENTENCES,
			//borderColor: '#888',
			//borderWidth: 1,
			//borderRadius : 1,
			font : {
				fontWeight : 'normal',
				fontSize : '17'
			},						
			left: 110,
			top: '10%',
			height: '80%',
			width: Ti.App.SCREEN_WIDTH*0.96- 110,
			visible: true
			});

			
		lastNameField.setEditable(canEdit);
		lastNameField.addEventListener('change', function (e) {
					privProfileInfo.editedLastName = e.source.value;
		});
		
		lastNameRow.add(lastNameLabel);
		lastNameRow.add(lastNameField);		
		profileView.appendRow(lastNameRow);
		profileView.lastName = lastNameField;				

	}
	
	
	function createProfileView (user) {
		Ti.API.info("create profile view");			
		var profileTable;

		profileTable = Ti.UI.createTableView({
			top: 10,
			height : '96%',
			rowHeight : 50,
			width : '100%',
			left : 2,
			borderRadius : 0,
			paddingLeft : 0,
			paddingRight : 0,
			layout: 'absolute',
			separatorColor: '#DDD',
			backgroundColor: '#DDD'
		});
		doDisplayUserProfile(user, profileTable);
		
		return profileTable;	    
	}
			
	
	function createProfileWindow(user, parentWin) {
		var acs = require('lib/acs'),
			Flurry = require('sg.flurry'),
			currentUser = acs.currentUser(),
			isSameUser = (user.id === currentUser.id),
			addFriendBtn,
			profileWin = Ti.UI.createWindow({title: user.username, backgroundColor: '#DDD'}),
			profileView = createProfileView(user),
			notifyAddedFriends, notificationSuccess;
		profileWin.add(profileView);
		profileWin.parentWin = parentWin;
		if (!isSameUser) {
			addFriendBtn = Ti.UI.createButton({title: Ti.Locale.getString('addFriend')});
			notificationSuccess = function (e) {
				var dialog = Ti.UI.createAlertDialog({
						title: Ti.Locale.getString('fashionista'), 
						message: Ti.Locale.getString('friendRequestSent') 
					});
				dialog.show();
				addFriendBtn.setTitle(Ti.Locale.getString('requestPending'));
				addFriendBtn.setEnabled(false);				
			};
			notifyAddedFriends = function (userIdList) {
						Flurry.logEvent('notifyAddedFriends', {'friendIdList': userIdList}); 
				        acs.newFriendNotification(userIdList, notificationSuccess);
				      };			
			profileWin.setRightNavButton(addFriendBtn);
			addFriendBtn.addEventListener('click', function (e) {
				Flurry.logEvent('addFriend', {'username': user.username, 'email': user.email}); 
				acs.addFriends([user.id], notifyAddedFriends);
			});			
		}

		profileWin.addEventListener('close', 
				function (e) {
					var hasChangedVisibly,
						parentWin = profileWin.parentWin;
					Flurry.logEvent('closeUserProfile', {'username': user.username, 'email': user.email});						
					if (currentUser.id === user.id) {
						hasChangedVisibly = saveProfileChanges(user);
						if (hasChangedVisibly) {
							parentWin.fireEvent('refreshFeedWindow');	
						}
					}
				}); 
		return profileWin;
	}
	
		
	function displayUserProfile(containingTab, user) {
		var acs = require('lib/acs'),
			Flurry = require('sg.flurry'),
			ProfileView = require('ui/common/ProfileView'),
			profileWin,
			currentUser = acs.currentUser();
		if (currentUser.id === user.id) {
			user = currentUser;
		}
		Flurry.logEvent('displayUserProfile', {'username': user.username, 'email': user.email});
		profileWin = createProfileWindow(user, containingTab.window);
		containingTab.open(profileWin);			
		
	}
	
	
	exports.createProfileView = createProfileView;
	exports.createProfileWindow = createProfileWindow;	
	exports.saveProfileChanges = saveProfileChanges;
	exports.resetProfileChanges	= resetProfileChanges;
	exports.displayUserProfile= displayUserProfile;
	
} ());
