//flicker feed of curated photos http://api.flickr.com/services/feeds/groups_pool.gne?id=1106056@N25&lang=en-us&format=json
// copyright 2012 by Monique Barbanson. All rights reserved.
//
// ThumbGrid window for images
"use strict"

var curatedPhotosPath = 'photos/';
var thumbnailsWindow = null;

exports.thumbnailsWindow = function () {
	 return thumbnailsWindow;
};

function getNavigationGroup() {
	if (thumbnailsWindow && thumbnailsWindow.parent) {
		var FeedWindow = require('ui/common/FeedWindow');
		FeedWindow.getNavigationGroup(thumbnailsWindow.parent);
	}
};

function showDetail (image) {
	//alert("showing Image detail" + image);

	var DetailWindow = require('ui/common/DetailWindow');
	var detailWindow = DetailWindow.showPreview(image);
	var navGroup = getNavigationGroup();
	navGroup.open(detailWindow);
	/*
	var back = Ti.UI.createButton({title:'back'});
	back.addEventListener('click', function(e) {
			detailView.hide(); 
			parentWin.remove(detailView); 
			parentWin.leftNavButton = null;
		});
	parentWin.setLeftNavButton(back);
*/

};

function displayThumbnails (tableView, photos) {
	//alert("displayThumbnailsView");
	var numPhotos = 0, 
		imgView, row, col, i, 
		tableData = [];

	numPhotos = photos !== "" ? photos.length : 0;
	var numRows = numPhotos / 3;
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
			image = image.urls? image.urls.thumb_100 : curatedPhotosPath + image;
			imgView = Ti.UI.createImageView({
				image: image,
			    top: 0,
				height:100,
				width:100,
				left: 5 + 105 * col
			});
			numPhotos -= 1;	

			imgView.addEventListener('click', function (e) {
					showDetail(e.source.image);
				});
			row.add(imgView);
		}
		tableData.push(row);
	}

	tableView.setData(tableData);
}

function getThumbnails (user, refreshThumbs, callback) {
	var acs,
		collectionId,
		photos = "";
		
	acs = require('lib/acs');
	
	if (refreshThumbs) acs.setUserPhotos(user, "");
	
	if (user) {
		photos = acs.getUserPhotos(user);
	    if (photos === "") {
	    	collectionId = acs.getPhotoCollectionId(user);
	    	if (collectionId != null) {
			    acs.getUserCollectionIdPhotos(user, collectionId, callback);
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

exports.createThumbnailsWindow = function (parentWin, user) {
	var tableView = null, scrollView = null, refreshBtn = null;
	if (!thumbnailsWindow) {
		thumbnailsWindow = Ti.UI.createWindow({
						        backgroundColor: 'black',
						        barColor: 'black',
						        titleControl: user.username
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
	   	thumbnailsWindow.parent = parentWin;
	   	
	   	// add refresh button to nav bar
		refreshBtn = Titanium.UI.createButton({
			systemButton: Titanium.UI.iPhone.SystemButton.REFRESH,
			style: Titanium.UI.iPhone.SystemButtonStyle.BAR
		});
		thumbnailsWindow.setRightNavButton(refreshBtn);
		refreshBtn.addEventListener('click', function(e) {thumbnailsWindow.fireEvent('refreshThumbs');});
	}
	else {
		tableView = thumbnailsWindow.tableView;
	}
	
	var refreshThumbnails = function (refreshThumbs) {
	   	getThumbnails(user, refreshThumbs,
	   					function (pics) {
	   						displayThumbnails (tableView, pics);
						}
		);			
	}
	
	if (user) {
		refreshThumbnails (false);	
		tableView.addEventListener('refreshThumbs', function (e) {
						refreshThumbnails(true);
		});	
	}
	else {
		initializeThumbnails(tableView);
	}


   	return thumbnailsWindow;  
};
