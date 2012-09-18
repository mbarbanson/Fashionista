//flicker feed of curated photos http://api.flickr.com/services/feeds/groups_pool.gne?id=1106056@N25&lang=en-us&format=json
// copyright 2012 by Monique Barbanson. All rights reserved.
//
// ThumbGrid window for images
"use strict"

var curatedPhotosPath = 'photos/';

function displayThumbnailsView (tableView, photos) {

	var numPhotos = 0, 
		imgView, row, col, i, 
		tableData = [];

	numPhotos = photos !== "" ? photos.length : 0;
	for (i = 0; i < 4; i = i + 1) {
		
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
			image = image.urls? image.urls.thumbs_100 : curatedPhotosPath + image;
			imgView = Ti.UI.createImageView({
				image: image,
			    //top: '10%',
			    //zIndex: 2,
			    //backgroundColor:'pink',
			    //borderColor: '#000',
			    //borderRadius: 2,
			    //borderWidth: 3,
			    top: 0,
				height:100,
				width:100,
				left: 5 + 105 * col
			});
			numPhotos -= 1;	

			imgView.addEventListener('click', function(e) {
				var DetailWindow = require('ui/common/DetailWindow');
				detailWindow = new DetailWindow(e.source.image);
				detailWindow.open();
				//alert("Go to detail window");
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
	}
	
}



function initializeThumbnailsView (tableView) {
	alert("initializeThumbnailsView");
   	var curatedPics = getCuratedThumbnails(true);	
   	displayThumbnailsView(tableView, curatedPics);
}

function refreshThumbnailsView (user, tableView) {
   	getThumbnails(user, true,
   					function (pics) {
   						displayThumbnailsView (tableView, pics);
					}
	);	
}

exports.createThumbnailsView = function (user, parentWin) {

	var tableView = Ti.UI.createTableView ({
		objname: 'ThumbnailView',
		backgroudColor: 'black',
		visible: true
	});
	
	if (user) {
		refreshThumbnailsView (user, tableView);	
		tableView.addEventListener('refreshThumbs', function (e) {
						refreshThumbnailsView(user, tableView);
		});	
	}
	else {
		initializeThumbnailsView(tableView);
	}

	var scrollView = Ti.UI.createScrollView ({
	    contentHeight: 'auto',
	    height: Ti.UI.FILL,
	    width: Ti.UI.SIZE,
		backgroudColor: 'black'
    });
    
   	scrollView.add(tableView);
   	parentWin.add(scrollView);
   	return tableView;  
};
