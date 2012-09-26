// copyright 2012 by Monique Barbanson. All rights reserved.
//
// ThumbGrid window for images
"use strict"

var curatedPhotosPath = 'photos/';
var thumbnailsWindow = null;
var acs = require('lib/acs');

exports.thumbnailsWindow = function () {
	 return thumbnailsWindow;
};

function getNavigationGroup() {
	if (thumbnailsWindow) {
		//var FeedWindow = require('ui/common/FeedWindow');
		//return FeedWindow.getNavigationGroup(thumbnailsWindow.parent);
		if (thumbnailsWindow.containingTab) {
			return thumbnailsWindow.containingTab;
		}
		else if (thumbnailsWindow.navigationGroup) {
			return thumbnailsWindow.navigationGroup;
		}
	}
	alert("thumbnailsWindow doesn't have a navigationGroup!!!!!")
	return null;
};

function showDetail (image) {
	//alert("showing Image detail" + image);
	var DetailWindow = require('ui/common/DetailWindow');
	var detailWindow = DetailWindow.showPreview(image);
	var navGroup = getNavigationGroup();
	if (navGroup) {
		navGroup.open(detailWindow);
	}

};

function displayThumbnails (tableView, photos) {
	//alert("displayThumbnailsView");
	var numPhotos = 0, 
		imgView, row, col, i, 
		tableData = [];

	numPhotos = photos !== "" ? photos.length : 0;
	
	if (numPhotos == 0) {
		
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
			text: "You're signed up, now let's get started. Take a picture by clicking on the purple camera button below!",
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
	    thumbnailsWindow.add(dialog);
	
	    ok.addEventListener('click', function(e){
	      	dialog.hide();  // should we just go ahead and remove()?
	    });
	    
	}

	var numRows = Math.max(numPhotos / 3, 4);
	for (i = 0; i < numRows; i = i + 1) {
		
		row = Ti.UI.createTableViewRow({
	        className:'row', // used to improve table performance
	        rowIndex:i, // custom property, useful for determining the row during events
	        height:105,
	        width: Ti.UI.SIZE,
	        top: 105*i,
	        left: 5
	      });
    
	    for (col = 0; col < 3; col = col + 1) {
			var image = numPhotos > 0 ? photos[numPhotos - 1] : 'IMG_0001.jpg';
			var thumb = null;
			imgView = Ti.UI.createImageView({
			    top: 0,
				height:100,
				width:100,
				left: 5 + 105 * col
			});
			
			// use thumb for grid view but keep a pointer to other sizes for detail view etc...
			if (image.urls) {
				imgView.urls = image.urls;
				thumb = image.urls.thumb_100;
			}
			else 
			{
				//FIXME: if there are no photos yet, this path doesn't point to a photo
				thumb = curatedPhotosPath + image;	
			}
				
			imgView.image = thumb;
			numPhotos -= 1;	

			imgView.addEventListener('click', function (e) {
					showDetail(e.source);
				});
			row.add(imgView);
		}
		tableData.push(row);
	}

	tableView.setData(tableData);

};


function clearThumbnails() {
	if (!thumbnailsWindow.tableView) {
		return;
	}
	var tableView = thumbnailsWindow.tableView;
	var rows = tableView.data;
	var numRows = rows.length;
	for (var i = 0; i < numRows; i++) {
		var imgViews = rows[i].children;
		var numImg = imgViews.length;
		for (var j = 0;j < numImg; j++) {
			imgViews[j] = null;
		}
	}
	tableView.data = null;
	thumbnailsWindow.navigationGroup = null;
	thumbnailsWindow.containingTab = null;
}

function getThumbnails (callback) {
	var collectionId,
		user = acs.currentUser(),
		photos = "";
	
	acs.setUserPhotos(user, "");
	if (user) {
		photos = acs.getUserPhotos(user);
	    if (!photos || photos === "") {
	    	collectionId = acs.getPhotoCollectionId(user);
	    	if (collectionId != null) {
			    acs.getUserCollectionIdPhotos(user, collectionId, callback);
	    	}
	    	else {
	    		Ti.API.info("empty user photo collection for " + user.username);
	    		callback("");
	    	}
    	}	    	
    } 
    else {
    	callback("");
    }	
}

function getCuratedThumbnails() {
	
	var photoDirectory = Ti.Filesystem.getFile(curatedPhotosPath);
	if (photoDirectory && photoDirectory.exists()) {
		var listing = photoDirectory.getDirectoryListing();
		return listing;
	}
	else {
		alert (photoDirectory + " doesn't exist");
		return [];
	}
	
}

function initializeThumbnails (tableView) {
   	var curatedPics = getCuratedThumbnails(true);	
   	displayThumbnails(tableView, curatedPics);
}

function refreshThumbnails () {
	if (acs.currentUser()) {
	   	getThumbnails(function (pics) {
	   						displayThumbnails (thumbnailsWindow.tableView, pics);
						}
		);			
	}
	else {
		initializeThumbnails(thumbnailsWindow.tableView);
	}			
}

function createThumbnailsWindow () {
	var tableView = null, scrollView = null, refreshBtn = null;
	var user = acs.currentUser();
	
	if (!thumbnailsWindow) {
		thumbnailsWindow = Ti.UI.createWindow({
						        backgroundColor: 'black',
						        barColor: 'black',
						        titleControl: user ? user.username : ''
						   		});
 
		tableView = Ti.UI.createTableView ({
			objname: 'ThumbnailView',
			backgroudColor: 'black',
			visible: true
		});
		thumbnailsWindow.tableView = tableView;
	
		scrollView = Ti.UI.createScrollView ({
		    contentHeight: 'auto',
		    height: Ti.UI.FILL,
		    width: Ti.UI.SIZE,
			backgroudColor: 'black'
    	});
	   	scrollView.add(tableView);
	   	thumbnailsWindow.add(scrollView);
	   	
	   	// add refresh button to nav bar
		refreshBtn = Titanium.UI.createButton({
			systemButton: Titanium.UI.iPhone.SystemButton.REFRESH,
			style: Titanium.UI.iPhone.SystemButtonStyle.BAR
		});
		thumbnailsWindow.setRightNavButton(refreshBtn);
		refreshBtn.addEventListener('click', function(e) {
			refreshThumbnails(true);
			});
	}
	else {
		tableView = thumbnailsWindow.tableView;
		clearThumbnails();
	}

   	return thumbnailsWindow;  
};

exports.clearThumbnails = clearThumbnails;
exports.createThumbnailsWindow = createThumbnailsWindow;
exports.refreshThumbnails = refreshThumbnails;
