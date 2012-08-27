//flicker feed of curated photos http://api.flickr.com/services/feeds/groups_pool.gne?id=1106056@N25&lang=en-us&format=json
// copyright 2012 by Monique Barbanson. All rights reserved.
//
// ThumbGrid window for images

function displayThumbs(tableView, photos) {

	var numPhotos = 0, 
		imgView, row, col, i, 
		tableData = [];

	numPhotos = photos !== "" ? photos.length : 0;
	for (i = 0; i < 4; i = i + 1) {
		
		row = Ti.UI.createTableViewRow({
	        className:'row', // used to improve table performance
	        //backgroundColor: 'blue',
	        rowIndex:i, // custom property, useful for determining the row during events
	        height:105,
	        width: Ti.UI.SIZE,
	        top: 105*i,
	        left: 5
	      });
    
	    for (col = 0; col < 3; col = col + 1) {

			imgView = Ti.UI.createImageView({
				image: numPhotos > 0 ? photos[numPhotos - 1].urls.thumb_100 : 'images/IMG_0001.jpg',
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
/*			
			imgView.addEventListener('click', function(e) {
				var DetailWindow = require('ui/common/DetailWindow');
				detailWindow = new DetailWindow(e.source.image);
				detailWindow.open();
				//alert("Go to detail window");
			});
			*/
			row.add(imgView);
		}
		tableData.push(row);
	}

	tableView.setData(tableData);
}

var ThumbnailsView = function(user, parentWin) {
	var acs,
		collectionId,
		photos,
		numPhotos,
		tableView;

	tableView = Ti.UI.createTableView({
		objname: 'ThumbnailView',
		backgroudColor: 'black',
		visible: false
	});
			
	acs = require('lib/acs');	
	
	if (user) {
		photos = acs.getUserPhotos(user);
	    if (photos === "") {
	    	collectionId = acs.getPhotoCollectionId(user);
	    	if (collectionId != null) {
			    acs.getUserCollectionIdPhotos(user, collectionId, function (pics) {displayThumbs(tableView, pics);});
	    	}
    	}	    	
    } 
    else {
    	displayThumbs(tableView, "");
    }
   
	var scrollView = Ti.UI.createScrollView({
	    contentHeight: 'auto',
	    height: Ti.UI.FILL,
	    width: Ti.UI.SIZE,
		backgroudColor: 'black'
    });
   	scrollView.add(tableView);
   	parentWin.add(scrollView);  
};

module.exports = ThumbnailsView;