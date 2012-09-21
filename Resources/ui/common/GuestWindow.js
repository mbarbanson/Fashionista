function GuestWindow(parent) {

	var refresh, 
		title, 
		flexSpace, 
		self, 
		navGroup, 
		signup, 
		login, 
		toolbar,
		thumbnailWin,
		acs;
	    
   // add a refresh button to the navBar 
	refresh = Titanium.UI.createButton({
		systemButton: Titanium.UI.iPhone.SystemButton.REFRESH,
		style: Titanium.UI.iPhone.SystemButtonStyle.BAR
	});
	
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
    
	self = Ti.UI.createWindow({
        backgroundColor: '#FFFFFF',
        barColor: '#5D3879',
        titleControl: title
    });
    		
	var ThumbnailsView = require('ui/common/ThumbnailsView');
	//alert("calling createThumbnailsView");
	ThumbnailsView.createThumbnailsView(null, self);

	navGroup = Titanium.UI.iPhone.createNavigationGroup({
   		window: self
	});
	//alert("created navgroup");
	parent.add(navGroup);
	//alert("added navgroup");
	// create fixed toolbar at bottom
    var signup = Ti.UI.createButton({
        title: L('Sign Up'),
        style: Ti.UI.iPhone.SystemButtonStyle.DONE,
    });
    
    var login = Ti.UI.createButton({
        title: L('Login'),
        style: Ti.UI.iPhone.SystemButtonStyle.DONE,
    });
    
    var toolbar = Titanium.UI.iOS.createToolbar({
        items:[flexSpace, login, flexSpace, signup, flexSpace],
        bottom:0,
        borderTop:true,
        barColor: 'black',
        borderBottom:false
    }); 
    self.add(toolbar);
    
    var ok = Titanium.UI.createButton({
		title: L('ok'),
		style: Ti.UI.iPhone.SystemButtonStyle.PLAIN, 
		borderColor: 'white',
		width: 40,
		height: 40,
		bottom: 5	
    });
    
    var label = Ti.UI.createLabel({
		color: 'white',
		backgroundColor: 'black',
		font: { fontSize: 14 },
		text: 'Use Fashionista when you need immediate advice\n from your friends about \na cute new shirt, \nsummer sandals or \nbeach shorts, anything else you can think of',
		textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
		top: 5,
		height: 150,
		width: 280
    });
    
    var dialog = Ti.UI.createView({
		color: 'white',
		backgroundColor: 'black',
		borderRadius: 6,
		top: 55,
		height: 200,
		width: 300
    });
    dialog.add(label);
    dialog.add(ok);
    self.add(dialog);

    ok.addEventListener('click', function(e){
      	dialog.hide();  // should we just go ahead and remove()?
    });
    
    acs = require('lib/acs');
    
	function signupCallback() {
		if(acs.isLoggedIn()===true) {
			self.close();
			navGroup.close();
		}
	}
	
    signup.addEventListener('click', function(e){
      	var LoginWindow = require('ui/common/LoginWindow');
        navGroup.open(new LoginWindow('signup', loginCallback));
    });
    
	function loginCallback() {
		if(acs.isLoggedIn()===true) {
			self.close();
			navGroup.close();
		}
	    var ApplicationTabGroup = require('ui/common/ApplicationTabGroup');
		new ApplicationTabGroup(acs.currentUser(), parent).open();
	}
		 
    login.addEventListener('click', function(e){
      	var LoginWindow = require('ui/common/LoginWindow');
        navGroup.open(new LoginWindow('login', loginCallback));
    });	   
     
    return self;
};

module.exports = GuestWindow;