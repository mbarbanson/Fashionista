// Not creating an actual GuestWindow anymore. Just creating a ThumbnailsWindow containing a navGroup
var ApplicationTabGroup = require('ui/common/ApplicationTabGroup');
var acs = require('lib/acs');


function createGuestWindow(parent) {
	'use strict';
	var ThumbnailsWindow,
		title, 
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
	
	title = Titanium.UI.createButton({
		color: 'white',	
		focusable: false,
		enabled: true,
		title: L('fashionista'),
		font: {fontFamily: 'Thonburi', fontsize: 30},
		style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN
	});
	    
    flexSpace = Titanium.UI.createButton({
        systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });

	ThumbnailsWindow = require('ui/common/ThumbnailsWindow');
	//alert("calling createThumbnailsWindow");
	thumbnailsWindow = ThumbnailsWindow.createThumbnailsWindow();
	ThumbnailsWindow.refreshThumbnails();
	
	//  crate a tab group with a single tab to hold the thubnail window stack
	guestTabGroup = ApplicationTabGroup.createApplicationTabGroup(parent);
	tab1 = Ti.UI.createTab({
		icon: '/icons/light_grid.png',
		window: thumbnailsWindow
	});
	thumbnailsWindow.containingTab = tab1;
	// hide tab Bar. We're just using a Tab Group to have a stack of windows without explicitly creating a navigation group which is an iOS only solution
	thumbnailsWindow.setTabBarHidden(true);
	guestTabGroup.addTab(tab1);
	guestTabGroup.open();
	guestTabGroup.setVisible(true);

	// create fixed toolbar at bottom
    signup = Ti.UI.createButton({
        title: L('Sign Up'),
        style: Ti.UI.iPhone.SystemButtonStyle.DONE
    });
    
    login = Ti.UI.createButton({
        title: L('Login'),
        style: Ti.UI.iPhone.SystemButtonStyle.DONE
    });
    
    toolbar = Titanium.UI.iOS.createToolbar({
        items:[flexSpace, login, flexSpace, signup, flexSpace],
        bottom:0,
        borderTop:true,
        barColor: 'black',
        borderBottom:false
    }); 
    thumbnailsWindow.add(toolbar);
    
    ok = Titanium.UI.createButton({
		title: L('ok'),
		style: Ti.UI.iPhone.SystemButtonStyle.PLAIN, 
		borderColor: 'white',
		width: 40,
		height: 40,
		bottom: 5	
    });
    
    label = Ti.UI.createLabel({
		color: 'white',
		backgroundColor: 'black',
		font: { fontSize: 14 },
		text: 'Use Fashionista when you need immediate advice\n from your friends about \na cute new shirt, \nsummer sandals or \nbeach shorts, anything else you can think of',
		textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
		top: 5,
		height: 150,
		width: 280
    });
    
    dialog = Ti.UI.createView({
		color: 'white',
		backgroundColor: 'black',
		borderRadius: 6,
		top: 55,
		height: 200,
		width: 300
    });
    dialog.add(label);
    dialog.add(ok);
    thumbnailsWindow.add(dialog);

	function loginCallback() {
		if(acs.isLoggedIn()===true) {	
			try {
				Ti.API.info("loginCallback");
				var mainTabGroup = ApplicationTabGroup.createApplicationTabGroup(parent);
				guestTabGroup.hide();
				guestTabGroup.close();
				guestTabGroup = null;
				ApplicationTabGroup.addMainWindowTabs(parent, mainTabGroup);
				mainTabGroup.open();
				mainTabGroup.setVisible(true);				
			}				
			catch (ex) {
				Ti.API.info("Caught exception " + ex.message);
			}
		}
	}

    ok.addEventListener('click', function(e){
		dialog.hide();  // should we just go ahead and remove()?
		thumbnailsWindow.remove(dialog);
    });
    
    signup.addEventListener('click', function(e){
		var LoginWindow = require('ui/common/LoginWindow');
        tab1.open(new LoginWindow('signup', loginCallback));
    });
	 
    login.addEventListener('click', function(e){
		var LoginWindow = require('ui/common/LoginWindow');
        tab1.open(new LoginWindow('login', loginCallback));
    });	   
   //FIXME do we need to return this?
    return thumbnailsWindow;
}

exports.createGuestWindow = createGuestWindow;