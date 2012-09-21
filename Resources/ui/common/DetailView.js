"use strict";

exports.showPreview = function(imgPath) {

	var imgView = Ti.UI.createImageView({
		title: 'preview',
		image: imgPath? imgPath : '/photos/IMG_0001.JPG',
		backgroundColor: 'black',
		width: Ti.UI.FILL,
		height: Ti.UI.FILL
	});

	imgView.show();
	return imgView;
/*
	if (true) {   //}!_bounty.captured) {
		var captureButton = Ti.UI.createButton({
			title:L('capture'),
			top:10,
			height:Ti.UI.SIZE,
			width:200
		});
		captureButton.addEventListener('click', function() {
			Ti.Geolocation.purpose = L('geo_purpose');
			if (Ti.Geolocation.locationServicesEnabled) {
				if(Ti.Platform.osname === 'android') {
					Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_HIGH;
				} else {
					Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
				}
				Ti.Geolocation.getCurrentPosition(function(e) {
					if(!e.error) {
						var lng = e.coords.longitude;
						var lat = e.coords.latitude;
						//db.bust(_bounty.id, lat, lng);
	
						var net = require('lib/network');
						net.bustFugitive(Ti.Platform.id, function(_data) {
							Ti.UI.createAlertDialog({
								message:_data.message
							}).show();
	
							//on android, give a bit of a delay before closing the window...
							if (Ti.Platform.osname == 'android') {
								setTimeout(function() {
									win.close();
								},2000);
							}
							else {
								win.close();
							}
						});
					} else {
						Ti.UI.createAlertDialog({
							title:L('geo_error'), 
							message:L('get_position_error')
						}).show();
					}
				});
			}
			else {
				Ti.UI.createAlertDialog({
					title:L('geo_error'), 
					message:L('geo_error_details')
				}).show();
			}
		});
		win.add(captureButton);
	}
	else {
		var mapButton = Ti.UI.createButton({
			title:L('map_button'),
			top:10,
			height:Ti.UI.SIZE,
			width:200
		});
		mapButton.addEventListener('click', function() {
			var MapWin = require('ui/common/MapWindow');
			var map = new MapWin(_bounty);
			map.open({modal:true});
		});
		win.add(mapButton);
	}


    var captionText = Ti.UI.createTextField({
      borderStyle: Ti.UI.INPUT_BORDERSTYLE_LINE,
      color: 'black',
      backgroundColor:'white',
      hintText:'picture caption',
      clearOnEdit: true,
      top: 5,
      left: 10,
      width: 300,
      height: 40
    });      
    win.add(captionText);	
    
	var postButton = Ti.UI.createButton({
		title:L('post'),
		bottom:5,
		height:Ti.UI.SIZE,
		width:100
	});
	postButton.addEventListener('click', function() {
		Ti.API.info("Post photo code goes here");
		win.close();
	});
	win.add(postButton);
	
    var post = Titanium.UI.createButton({
        title: 'post',
        style: Titanium.UI.iPhone.SystemButtonStyle.DONE,
    });
    
    post.addEventListener('click', function() {
    	alert("This will take you to a page where you can select where to post this");
    	//win.close();
    })
    win.setRightNavButton(post);
	

	if (true) {   //_bounty.captured) {
		var bragButton = Ti.UI.createButton({
			title:L('login2brag'),
			top:10,
			height:Ti.UI.SIZE,
			width:200
		});
		// Require the ACS modules
		var acs = require('lib/acs');
		if(acs.isLoggedIn()) {
			// if logged in, the button's title is "Brag"
			bragButton.title = L('brag');
		}
		bragButton.addEventListener('click', function() {
			if (acs.isLoggedIn() == false) {
				// if not logged in, show the login window
				var LoginWin = require('ui/common/LoginWindow');
				var loginwindow = new LoginWin;
				containingTab.open(loginwindow);
				// we must use a callback, because ACS functions are asynchronous
				loginwindow.addEventListener('close', function(){
					if(acs.isLoggedIn()) {
						bragButton.title = L('brag');
						addListBragsButton();
					}
				});
			} else {
				// otherwise, show the message window
				var msgWin = require('ui/common/messageWindow').messageWindow('message', imgView.toBlob());
				containingTab.open(msgWin);
			}
		});
		win.add(bragButton);			

		var listBragsButtonAdded = false;
		
		function addListBragsButton() {
			if(!listBragsButtonAdded) {
				// if logged in, add a "list brags" button to the window
				if(acs.isLoggedIn()) {
					var listBragsButton = Ti.UI.createButton({
						title:L('listbrags'),
						top:10,
						height:Ti.UI.SIZE,
						width:200
					});
					listBragsButton.addEventListener('click', function() {
							// open the brags list window
							var BragsWindow = require('ui/common/BragsWindow');
							containingTab.open(new BragsWindow);
					});
					win.add(listBragsButton);
					listBragsButtonAdded = true;		
				}
			}
		}
		addListBragsButton();

	}
	
	return win;
	*/
};
