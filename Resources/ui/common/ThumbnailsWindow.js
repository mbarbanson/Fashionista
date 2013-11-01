// copyright 2012 by Monique Barbanson. All rights reserved.
//
// ThumbGrid window for images

(function () {
	"use strict";
	
	var curatedPhotosPath = 'photos/';
	
	
	function showPreview (tab, thumbView) {
		var LoginToolbar = require('ui/common/LoginToolbar'),
			imgView = null,
			detailWindow = Ti.UI.createWindow({
									title: Ti.Locale.getString('fashionista'),
							        backgroundColor: 'black',
							        //navTintColor: Ti.Locale.getString('themeColor'),
							        statusBarStyle: Ti.UI.iPhone.StatusBar.LIGHT_CONTENT,
							        extendEdges: [Ti.UI.EXTEND_EDGE_LEFT, Ti.UI.EXTEND_EDGE_RIGHT]				
							}),
			toolbar = LoginToolbar.createLoginToolbar(tab, detailWindow);

		imgView = Ti.UI.createImageView({
			backgroundColor: 'black',
			width: Ti.UI.FILL
		});
		detailWindow.add(imgView);
		detailWindow.add(toolbar);

		// use small_240 if present, otherwise use the thumbnail itself or fallback image if neither has a value
		imgView.image = thumbView.image || '/photos/IMG_0001.JPG';
		//imgView.show();
		
		return detailWindow;
	}

	

	function showDetail (image) {
		//alert("showing Image detail" + image);
		var tab = Ti.App.guestTabGroup.getActiveTab(),
			detailWindow = showPreview(tab, image);
		if (tab) {
			tab.open(detailWindow);
		}
	}
	
	
	function displayThumbnails (tableView, photos) {
		Ti.API.info("displayThumbnailsView");
		var numPhotos = 0,
		    isValidPhoto = function (imagePath) { 
								imagePath = Ti.Filesystem.getFile(curatedPhotosPath + imagePath); 
								return imagePath.exists(); 
							}, 
			imgView, row, col, i, 
			tableData = [],
			numRows,
			image, thumb,
			showPhotoDetailCallback = function (e) {
											showDetail(e.source);	
										},
			clearThumbnails = function (e) {
				var data = tableView.getData();
				for (i= 0; i < numRows; i = i + 1) {
					row = data[i];
					tableView.remove(row);
				}
			};
	
		photos = photos.filter(isValidPhoto, photos);	
		numPhotos = photos !== "" ? photos.length : 0;
	    if (numPhotos === 0) { return; }
	    
		numRows = Math.max(numPhotos / 3, 4);
		for (i = 0; i < numRows; i = i + 1) {
			
			row = Ti.UI.createTableViewRow({
		        className:'row', // used to improve table performance
		        rowIndex:i, // custom property, useful for determining the row during events
		        height: '25%',
		        width: Ti.UI.SIZE,
		        top: (25*i).toString() + '%',
		        left: 5
		      });
	    
		    for (col = 0; col < 3; col = col + 1) {
				image = (numPhotos > 0 ? photos[numPhotos - 1] : 'pic12.jpg');
				thumb = null;
				imgView = Ti.UI.createImageView({
				    top: 0,
					width: '33%', //100,
					left: (33*col).toString() +'%'            //5 + 105 * col
				});
				
				// use thumb for grid view but keep a pointer to other sizes for detail view etc...
				if (image.urls) {
					imgView.urls = image.urls;
					thumb = image.urls.thumb_100;
				}
				// photo was just uploaded thumb size has not been created yet
				else if (!image.processed && image.filename) {
					Ti.API.info("Thumb has not been created yet. Use fullsize image");
					thumb = image.filename;
				}
				else 
				{
					//FIXME: if there are no photos yet, this path doesn't point to a photo
					thumb = curatedPhotosPath + image;	
				}
					
				imgView.image = thumb;
				numPhotos -= 1;	
	
				imgView.addEventListener('click', showPhotoDetailCallback);
				row.add(imgView);
			}
			tableData.push(row);
		}
	
		tableView.setData(tableData);
		//tableView.setVisible(true);
	}
		
	
	function getCuratedThumbnails() {		
		var photoDirectory = Ti.Filesystem.getFile(curatedPhotosPath),
			listing;
		if (photoDirectory && photoDirectory.exists()) {
			listing = photoDirectory.getDirectoryListing();
		}
		else {
			alert (photoDirectory + " doesn't exist");
			listing = [];
		}
		return listing;
		
	}
	
	function initializeThumbnails (tableView) {
		var curatedPics = getCuratedThumbnails(true);	
		displayThumbnails(tableView, curatedPics);
	}
	
		
	function createThumbnailsWindow () {
		var LoginToolbar = require('ui/common/LoginToolbar'),
			tableView = null, 
			refreshBtn = null,
			guestThumbnailsWindow = null,
			toolbar = null,
			cleanupThumbnailsWindow = function (e) {
				var win = e.source;
				if (tableView) {
					tableView.setData(null);
				}
				win.remove(tableView);
				win.remove(toolbar);
				win.tableView = null;
				tableView = null;
				toolbar = null;					
			};
		
		guestThumbnailsWindow = Ti.UI.createWindow({
								title: Ti.Locale.getString('fashionista'),
						        backgroundColor: 'transparent',
								font: {
									fontFamily: Ti.App.defaultFontFamily,
									fontWeight: 'normal'
								},						        
						        //navTintColor: Ti.Locale.getString('themeColor'),
						        statusBarStyle: Ti.UI.iPhone.StatusBar.LIGHT_CONTENT,
						        extendEdges: [Ti.UI.EXTEND_EDGES_LEFT, Ti.UI.EXTEND_EDGES_RIGHT, Ti.UI.EXTEND_EDGES_BOTTOM],
						        tabBarHidden: true
								});
 
		tableView = Ti.UI.createTableView ({
			objname: 'ThumbnailView',
			backgroudColor: 'transparent'
		});
		
		initializeThumbnails(tableView);	
		guestThumbnailsWindow.tableView = tableView;			
		guestThumbnailsWindow.add(tableView);
		
		// create fixed toolbar at bottom   
	    toolbar = LoginToolbar.createLoginToolbar();
	    guestThumbnailsWindow.add(toolbar);
					
		// add refresh button to nav bar
		refreshBtn = Titanium.UI.createButton({
			systemButton: Titanium.UI.iPhone.SystemButton.REFRESH,
			style: Titanium.UI.iPhone.SystemButtonStyle.BAR
		});
		guestThumbnailsWindow.setRightNavButton(refreshBtn);
		refreshBtn.addEventListener('click', function(e) {
			initializeThumbnails(tableView);
			});
			
		guestThumbnailsWindow.addEventListener('close', cleanupThumbnailsWindow);

		
		return guestThumbnailsWindow;  
	}
	
	exports.createThumbnailsWindow = createThumbnailsWindow;
	exports.showPreview = showPreview;	

} ());
