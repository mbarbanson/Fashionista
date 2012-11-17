/**
 * @author MONIQUE BARBANSON
 */

var ThumbnailsWindow = require('ui/common/ThumbnailsWindow');
var Contacts = require('lib/contacts');
var FB = require('lib/facebook');

function sharePhoto(photoUrl) {
	"use strict";

	Ti.API.info("sharePhoto: refresh the thumbnail window");
	ThumbnailsWindow.refreshThumbnails();
	Ti.API.info("This is where the user chooses who to share this image with");
	//FIXME move this behind a button
	Contacts.testContacts();
	//FIXME move this behind a button
	// log into facebook and link to external account on success
	FB.authorize();
	
	// post to wall
	FB.postToWall(photoUrl);
	// call this to login with facebook instead of having fashionista specific credentials
	//FB.linktoFBAccount();
};

function createShareWindow(photoUrl) {
	"use strict";
	var shareBtn,
		shareWindow,
		caption,
		shareLabel,
		shareTable,
		shareToFBFriends;
	
	shareBtn = Titanium.UI.createButton({
		style: Titanium.UI.iPhone.SystemButtonStyle.DONE,
		title: L('share')
	});
	shareBtn.addEventListener('click', function (e) {
											sharePhoto(photoUrl);
											});
	shareWindow = Ti.UI.createWindow({
		backgroundColor: 'black',
		barColor: '#5D3879',
		rightNavButton: shareBtn,
		title: L('share'),
		tabBarHidden: true
	});
	
	caption = Ti.UI.createTextField({
		hintText:L('add a caption here...'),
		autocorrect: false,
		autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
		top:25,
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
	
	shareWindow.add(caption);
	
	shareLabel = Ti.UI.createLabel({title: 'Choose friends from'});
	shareTable = Ti.UI.createTableView();
	shareToFBFriends = Ti.UI.createTableViewRow({
				title: 'facebook',
				color: '#fff',
				height:Ti.UI.SIZE
			});
	shareToAddressBook = Ti.UI.createTableViewRow({
				title: 'address book',
				color: '#fff',
				height:Ti.UI.SIZE
			});
	shareTable.appendRow(shareToFBFriends);
	shareTable.appendRow(shareToAddressBook);

}

exports.createShareWindow = createShareWindow;
