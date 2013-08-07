/**
 * @author MONIQUE BARBANSON
 * copyright 2012, 2013 by Monique Barbanson. All rights reserved.
 */



function createGuestWindow() {
	'use strict';
	var acs = require('lib/acs'),
		Flurry = require('ti.flurry'),
		ThumbnailsWindow,
		ApplicationTabGroup,
		LoginWindow,
//		title, 
		flexSpace, 
		navGroup, 
		signup, 
		login, 
		toolbar,
		ok,
		label,
		dialog,
		thumbnailsWindow,
		guestTabGroup,
		tab1;
	
	ApplicationTabGroup = require('ui/common/ApplicationTabGroup');
	LoginWindow = require('ui/common/LoginWindow');
/*	
	title = Titanium.UI.createButton({
		color: 'white',	
		focusable: false,
		enabled: true,
		title: Ti.Locale.getString('fashionista'),
		font: {fontFamily: 'Thonburi', fontsize: 30},
		style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN
	});
	    

*/
	ThumbnailsWindow = require('ui/common/ThumbnailsWindow');
	thumbnailsWindow = ThumbnailsWindow.createThumbnailsWindow();
	ThumbnailsWindow.refreshThumbnails();
	Flurry.logEvent('GuestPageThumbnailsVisible')
	//  crate a tab group with a single tab to hold the thubnail window stack
	guestTabGroup = Ti.UI.createTabGroup();
	tab1 = Ti.UI.createTab({
		icon: '/icons/light_grid.png',
		window: thumbnailsWindow
	});
	thumbnailsWindow.containingTab = tab1;
	// hide tab Bar. We're just using a Tab Group to have a stack of windows without explicitly creating a navigation group which is an iOS only solution
	thumbnailsWindow.setTabBarHidden(true);
	guestTabGroup.addTab(tab1);
	guestTabGroup.setActiveTab(0);
	guestTabGroup.open({transition: Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});

	// create fixed toolbar at bottom
    flexSpace = Titanium.UI.createButton({
        systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });

    signup = Ti.UI.createButton({
        title: Ti.Locale.getString('signup'),
        style: Ti.UI.iPhone.SystemButtonStyle.DONE,
        backgroundColor: '#5D3879'
    });
    
    login = Ti.UI.createButton({
        title: Ti.Locale.getString('login'),
        style: Ti.UI.iPhone.SystemButtonStyle.DONE,
        backgroundColor: '#5D3879'
    });
    
    toolbar = Titanium.UI.iOS.createToolbar({
        items:[flexSpace, login, flexSpace, signup, flexSpace],
        bottom:0,
        borderTop:true,
        barColor: '#5D3879',
        borderBottom:false
    }); 
    thumbnailsWindow.add(toolbar);
/*    
    ok = Titanium.UI.createButton({
		title: Ti.Locale.getString('ok'),
		style: Ti.UI.iPhone.SystemButtonStyle.PLAIN, 
		borderColor: 'white',
		width: 40,
		height: 40,
		bottom: 5	
    });
    
    label = Ti.UI.createLabel({
		color: 'white',
		backgroundColor: 'transparent',
		font: { fontSize: 20 },
		text: Ti.Locale.getString('welcome_message'),
		textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
		wordWrap : true,
		horizontalWrap : true,		
		top: 5,
		height: 150,
		width: 280
    });
    
    dialog = Ti.UI.createWindow({
		modal: true,
		modalStyle: Titanium.UI.iPhone.MODAL_PRESENTATION_FORMSHEET,
		color: 'white',
		backgroundColor: '#5D3879',
		borderRadius: 2,
		top: 55,
		height: 200,
		width: 300
    });
    dialog.add(label);
    dialog.add(ok);
    

    ok.addEventListener('click', function(e){
		dialog.hide();  // should we just go ahead and remove()?
		thumbnailsWindow.remove(dialog);
    });    
    thumbnailsWindow.add(dialog);
*/
	function loginCallback() {
		// if a user has successfully logged in or signed up
		if (acs.currentUser()) {	
			try {
				Ti.API.info("loginCallback");
				Flurry.logEvent('SucessfulSignupOrLogin');				
				if (!Ti.App.mainTabGroup) {
					ApplicationTabGroup.initAppUI();					
				}
				// hide guest tabgroup
				if (guestTabGroup) {
					guestTabGroup.close();
					guestTabGroup = null;					
				}
			}				
			catch (ex) {
				Ti.API.info("Caught exception " + ex.message);
			}
		}
	}

    
    signup.addEventListener('click', function(e){
        tab1.open(LoginWindow.createLoginWindow('signup', loginCallback, tab1));
		Flurry.logEvent('SignupClick', { 'button': "signupButton" });        
    });
	 
    login.addEventListener('click', function(e){
        tab1.open(LoginWindow.createLoginWindow('login', loginCallback, tab1));
		Flurry.logEvent('LoginClick', { 'button': "loginButton" });        
    });
	   
	//FIXME do we need to return this?
	return thumbnailsWindow;
}

exports.createGuestWindow = createGuestWindow;