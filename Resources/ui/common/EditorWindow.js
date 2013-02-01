"use strict";

var editorWindow = null, 
	editorView = null;

function createEditorWindow (user) {
	editorWindow = editorWindow || Ti.UI.createWindow({
		barColor: 'black'
	});
	editorView = editorView || EditorView.createEditorView(editorWindow, user);
	editorWindow.add(editorView);

	editorView = editorView ||
					Ti.UI.createImageView({
							title: 'preview',
							backgroundColor: 'black',
							top: 0,
							width: Ti.UI.FILL,
							height: Ti.UI.FILL
						});   

    var close = Titanium.UI.createButton({
		//image: 'icons/light_x.png',
		//backgroundImage: 'none',
		//color: 'purple',
        //style: Titanium.UI.iPhone.SystemButtonStyle.BAR,
        //backgroundColor: 'purple',
        style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
        systemButton:Titanium.UI.iPhone.SystemButton.STOP
    });
	    
    var flexSpace = Titanium.UI.createButton({
        systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });
    //eventually we will add more edit actions, see Instagram's editor window top toolbar buttons 
    var topToolbar = Titanium.UI.iOS.createToolbar({
        items:[flexSpace, close],
        top:0,
        borderBottom:true,
        borderTop:true,
		barColor: 'black',
		height: 50
    });
	    
	var accept = Titanium.UI.createButton({
    	image: 'icons/light_check.png',
    	//backgroundImage: 'none',
    	//color: 'purple',
        style: Titanium.UI.iPhone.SystemButtonStyle.BAR,
        //backgroundColor: 'purple',
        //style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
        //systemButton:Titanium.UI.iPhone.SystemButton.STOP
    });
    
    var bottomToolbar = Titanium.UI.iOS.createToolbar({
        items:[flexSpace, accept, flexSpace],
        bottom:0,
        borderBottom:true,
        borderTop:true,
		barColor: 'black',
		height: 50
    });
     
    editorWindow.add(bottomToolbar);
    editorWindow.add(topToolbar); 
	    
    // close editor when close button is selected 
	close.addEventListener('click', function() {
		Ti.API.info("closing editor window");
		var tab = parentWin.containingTab;
		tab.close(parentWin);
	});
	
	// pass in a callback if we want to do sthg on successful upload
	var sharePhoto = function (user, image, callback) {
						Ti.API.info("This is where the user chooses who to share this image with");
						var acs = require('lib/acs');
						acs.uploadPhoto(image, acs.getPhotoCollectionId(user), callback);	
						};
	accept.addEventListener('click', function() {
										Ti.API.info("Accept edited photo");
										sharePhoto(user, editorView.getImage());
										var tab = parentWin.containingTab;
										tab.close(parentWin);
									}); 	
	  
	return editorWindow;
}



function showEditorWindow (user, image) {
	
	if (editorView == null) return;  // null or undefined
	editorView.image = image;
	//editorView.show();
}

exports.createEditorWindow = createEditorWindow;
exports.showEditorWindow = showEditorWindow;
