// copyright 2012 by Monique Barbanson. All rights reserved.
//
// ThumbGrid window for images

(function () {
	"use strict";
	
	var curatedPhotosPath = 'photos/',
		guestThumbnailsWindow = null,
		privThumbnailsWindow = null,
		acs = require('lib/acs'),
		DetailWindow = require('ui/common/DetailWindow');
	
	function thumbnailsWindow() {
		var thumbnailsWin = guestThumbnailsWindow;
		if (acs.currentUser()) {
			thumbnailsWin = privThumbnailsWindow;	
		}
		return thumbnailsWin;
	}

	function showDetail (image) {
		//alert("showing Image detail" + image);
		var detailWindow = DetailWindow.showPreview(image),
			navGroup = thumbnailsWindow().containingTab;
		if (navGroup) {
			navGroup.open(detailWindow);
		}
	
	}
	
	function showPhotoDetailCallback(e) {
		showDetail(e.source);	
	}
	
	function displayThumbnails (tableView, photos) {
		Ti.API.info("displayThumbnailsView");
		var numPhotos = 0, 
			imgView, row, col, i, 
			tableData = [],
			ok, label, dialog, numRows,
			image, thumb;
	
		numPhotos = photos !== "" ? photos.length : 0;
		
		if (numPhotos === 0) {
			
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
				text: "You're signed up, now let's get started. Take a picture by clicking on the purple camera button below!",
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
		    thumbnailsWindow().add(dialog);
		
		    ok.addEventListener('click', function(e){
											dialog.hide();  // should we just go ahead and remove()?
		    });
		    
		}
	
		numRows = Math.max(numPhotos / 3, 4);
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
				image = (numPhotos > 0 ? photos[numPhotos - 1] : 'IMG_0001.jpg');
				thumb = null;
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
		tableView.setVisible(true);
	}
	
	
	function clearThumbnails() {
		
		if (!thumbnailsWindow().tableView) {
			return;
		}
		// clear tableView rows to avoid memory leaks
		// null out imageViews also, just to be safe
		var tableView = thumbnailsWindow().tableView,
			rows = tableView.data,
			numRows = rows.length,
			i, imgViews, numImg, j;
		for (i = 0; i < numRows; i = i + 1) {
			imgViews = rows[i].children;
			numImg = imgViews.length;
			for (j = 0;j < numImg; j = j + 1) {
				imgViews[j] = null;
			}
		}
		tableView.data = null;
		tableView.setVisible(false);
		thumbnailsWindow().containingTab = null;
	}
	
	function getThumbnails (callback) {
		var collectionId,
			user = acs.currentUser(),
			photos = "";
			
		// debug code to sanity check things
		if (!user) {
			alert("user is null and shouldn't be");
		}
		
		if (user) {
			photos = acs.getUserPhotos(user);
			if (!photos || photos === []) {
				Ti.API.info("About to clear user photos " + photos);
				collectionId = acs.getPhotoCollectionId(user);
				if (collectionId !== null) {
				    acs.getUserCollectionIdPhotos(collectionId, callback);
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
	
	function refreshThumbnails () {
		// if there is a logged in user, retrieve the photoCollection and display the corresponding thumbnails
		if (acs.currentUser()) {
			getThumbnails(function (pics) {
								displayThumbnails (privThumbnailsWindow.tableView, pics);
							}
			);			
		}
		else { //if there is no logged in user, display curated thumbnails
			initializeThumbnails(guestThumbnailsWindow.tableView);
		}			
	}
	
	function createThumbnailsWindow () {
		var tableView = null, 
			refreshBtn = null;
		
		if (acs.currentUser()) {
			if (!privThumbnailsWindow) {
				privThumbnailsWindow = Ti.UI.createWindow({
								        backgroundColor: 'transparent',
								        barColor: '#5D3879'
										});
			 
				tableView = Ti.UI.createTableView ({
					objname: 'ThumbnailView',
					backgroudColor: 'transparent',
					//separatorStyle: Ti.UI.iPhone.TableViewSeparatorStyle.NONE,
					visible: false
				});
				privThumbnailsWindow.tableView = tableView;
		
				privThumbnailsWindow.add(tableView);
				
				// add refresh button to nav bar
				refreshBtn = Titanium.UI.createButton({
					systemButton: Titanium.UI.iPhone.SystemButton.REFRESH,
					style: Titanium.UI.iPhone.SystemButtonStyle.BAR
				});
				privThumbnailsWindow.setRightNavButton(refreshBtn);
				refreshBtn.addEventListener('click', function(e) {
					refreshThumbnails(true);
					});
			}
			else { //thumbnailsWindow already exists 
			
				clearThumbnails();
			}
		}
		else {
			if (!guestThumbnailsWindow) {
				guestThumbnailsWindow = Ti.UI.createWindow({
								        backgroundColor: 'transparent',
								        barColor: '#5D3879'
										});
			 
					tableView = Ti.UI.createTableView ({
						objname: 'ThumbnailView',
					backgroudColor: 'transparent',
					//separatorStyle: Ti.UI.iPhone.TableViewSeparatorStyle.NONE,
					visible: false
				});
				guestThumbnailsWindow.tableView = tableView;
			
				guestThumbnailsWindow.add(tableView);
				
				// add refresh button to nav bar
				refreshBtn = Titanium.UI.createButton({
					systemButton: Titanium.UI.iPhone.SystemButton.REFRESH,
					style: Titanium.UI.iPhone.SystemButtonStyle.BAR
				});
				guestThumbnailsWindow.setRightNavButton(refreshBtn);
				refreshBtn.addEventListener('click', function(e) {
					refreshThumbnails(true);
					});
			}
			else { //thumbnailsWindow already exists 
			
				clearThumbnails();
			}
			
		}
		
		return thumbnailsWindow();  
	}
	
	exports.clearThumbnails = clearThumbnails;
	exports.createThumbnailsWindow = createThumbnailsWindow;
	exports.refreshThumbnails = refreshThumbnails;
	exports.thumbnailsWindow = thumbnailsWindow;

}) ();
