/**
 * @author MONIQUE BARBANSON
 */

function createShareWindow(photoBlob, shareAction) {
	'use strict';
	var ApplicationTabGroup,
		ListWindow,
		social,
		shareBtn,
		cancelBtn,
		shareWindow,
		shareTabGroup,
		tab,
		caption,
		shareLabel,
		shareTable,
		tableData,
		shareToFBFriends,
		shareToAddressBook,
		inviteFBFriends,
		inviteContacts,
		followFBFriend;
	
	ApplicationTabGroup = require('ui/common/ApplicationTabGroup');
	ListWindow = require('ui/common/ListWindow');
	social = require('lib/social');
	
	// right nav button is Share
	shareBtn = Titanium.UI.createButton({
		style: Titanium.UI.iPhone.SystemButtonStyle.DONE,
		title: L('shareButton')
	});
	cancelBtn = Titanium.UI.createButton({
		style: Titanium.UI.iPhone.SystemButtonStyle.DONE,
		title: L('cancel')
	});
	
	// share window										
	shareWindow = Ti.UI.createWindow({
		backgroundColor: '#ddd',
		color: 'black',
		barColor: '#5D3879',
		rightNavButton: shareBtn,
		leftNavButton: cancelBtn,
		title: L('shareWindow')
	});
	
	shareBtn.addEventListener('click', function (e) {
											alert("calling sharePhoto. photoBlob = " + photoBlob);
											social.sharePhoto(photoBlob, caption.value);
											shareTabGroup.close();
											});
	cancelBtn.addEventListener('click', function (e) {
											shareTabGroup.close();
											});
	//  crate a tab group with a single tab to hold the share window stack
	shareTabGroup = ApplicationTabGroup.createApplicationTabGroup();
	tab = Ti.UI.createTab({
		icon: '/icons/light_grid.png',
		window: shareWindow
	});
	shareWindow.containingTab = tab;
	// hide tab Bar. We're just using a Tab Group to have a stack of windows without explicitly creating a navigation group which is an iOS only solution
	shareWindow.setTabBarHidden(true);
	shareTabGroup.addTab(tab);
	shareTabGroup.open();
	shareTabGroup.setVisible(true);
	
	// create share window elements
	caption = Ti.UI.createTextArea({
		value: L('Add a caption ...'),
		color: '#aaa',
		autocorrect: false,
		autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
		top:10,
		left: '5%',
		width: '90%',
		height: 100,
		font: {
			fontWeight: 'normal',
			fontSize: '17'
		},
		textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
		verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
		wordWrap: true,
		horizontalWrap: true,
		borderRadius: 5,
		paddingLeft: 2, 
		paddingRight: 2,
		backgroundColor: 'white',
		//borderColor: 'black',
		//borderWidth: 1
	});
	shareWindow.add(caption);
	
	caption.privHintText = caption.value;
 
	caption.addEventListener('focus',function(e){
	    if(e.source.value === e.source.privHintText){
	        e.source.value = "";
	        e.source.color = 'black';
	    }
	});
	caption.addEventListener('blur',function(e){
	    if(e.source.value ===""){
	        e.source.value = e.source.privHintText;
	        e.source.color = '#aaa';
	    }
	});
	
	shareLabel = Ti.UI.createLabel({
		text: 'Choose friends to share with',
		textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
		verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
		wordWrap: true,
		color: 'black',
		top: 120,
		left: '5%',
		height: 40,
		width: '90%',
		paddingLeft: 2, 
		paddingRight: 2,
		font: {
			fontWeight: 'bold',
			fontSize: '20'
		}
	});
	shareWindow.add(shareLabel);
	
	shareTable = Ti.UI.createTableView({
		top: 170,
		height: Ti.UI.SIZE,
		rowHeight: 50,
		width: '90%',
		left: '5%',
		borderRadius: 5,
		backgroundColor: 'transparent',
		//borderColor: 'black',
		//borderWidth: 1,
		paddingLeft: 0, 
		paddingRight: 2
	});
	
	shareToFBFriends = Ti.UI.createTableViewRow({
				className: 'shareSource',
				title: 'from facebook',
				color: 'black',
				backgroundColor: '#fff',
				height: 40,
				left: 0,
				//borderWidth: 1,
				//borderColor: 'black',
				//leftImage: '/images/f_logo.png',
				hasChild: true
	});
	
	followFBFriend = function (friend) {
			Ti.API.info("followFBFriend id: " + friend.id + " username " + friend.username);	
	};
	
	shareToFBFriends.addEventListener('click', function (e) {
		var callback = function (friends) {
									var listWin;
									if (friends && friends.length > 0) {
										Ti.API.info("create and populate list of friends window");
										listWin = ListWindow.populateList(friends, followFBFriend);
										listWin.containingTab = tab;
										tab.open(listWin);
									}
									else {
										Ti.API.info('Current user is the first in their social network to use Fashionista! Kudos!');
									}
					},
		//facebook integration
			FB = require('lib/facebook'),
			authCB = function () { 
				Ti.API.info ("facebook authorize callback");
				social.findFBFriends (callback); 
			};
		FB.authorize(authCB);								
	});
	
	shareToAddressBook = Ti.UI.createTableViewRow({
				className: 'shareSource',		
				title: 'from your contacts',
				color: 'black',
				backgroundColor: '#fff',
				top: 50,
				height: 40,
				left: 0,
				//borderWidth: 1,
				//borderColor: 'black',
				//leftImage: '/images/contacts-medium.png',								
				hasChild: true
	});
	
	inviteFBFriends = Ti.UI.createTableViewRow({
				className: 'shareSource',		
				title: 'invite via facebook',
				color: 'black',
				backgroundColor: '#fff',				
				top: 100,
				height: 40,
				left: 0,
				//borderWidth: 1,
				//borderColor: 'black',
				//leftImage: '/images/f_logo.png',				
				hasChild: true
	});
	inviteContacts = Ti.UI.createTableViewRow({
				className: 'shareSource',		
				title: 'invite via text',
				color: 'black',
				backgroundColor: '#fff',				
				top: 150,
				height: 40,
				left: 0,
				//borderWidth: 1,
				//borderColor: 'black',	
				//leftImage: '/images/contacts-medium.png',							
				hasChild: true
	});
	shareTable.appendRow(shareToFBFriends);
	shareTable.appendRow(shareToAddressBook);
	shareTable.appendRow(inviteFBFriends);
	shareTable.appendRow(inviteContacts);
	shareWindow.add(shareTable);
	
	return shareWindow;
}

exports.createShareWindow = createShareWindow;
