(function () {
	'use strict';

	function createMoreDialog() {
	
		var isAndroid = Ti.Platform.osname === 'android',
			actionDialogOpts,
			dialog;
			
		
		//
		// BASIC OPTIONS DIALOG
		//
		
		actionDialogOpts = {
			options:['Where can I find this?', 'Get Purchase Approval' , 'Save to Camera Roll', 'Flag As Inappropriate', 'Cancel'],
			destructive:3,
			cancel:4,
			selectedIndex: 4,
			title:'Other things you may want to do'
		};
		
		
		dialog = Titanium.UI.createOptionDialog(actionDialogOpts);
		
		// add event listener
		dialog.addEventListener('click',function(e)
		{
			Ti.API.info ('You selected ' + e.index);
			
		});
		dialog.show();
		
		
		// BUTTON TO MODIFY DIALOG AND SHOW
		/*
		button2 = Titanium.UI.createButton({
			title:'Modify and Show Dialog',
			height:40,
			width:200,
			top:60
		});
		button2.addEventListener('click', function()
		{
			dialog.title = 'I changed the title';
			dialog.options = ['New Option 1', 'New Option 2', 'New Option 3', 'New Option 4'];
			dialog.destructive = 0;
			dialog.cancel = 3;
			if (isAndroid) {
				dialog.androidView = null;
				applyButtons();
			}
			dialog.show();
		});
		*/
		
		return dialog;
	}
	
	exports.createMoreDialog = createMoreDialog;
	
} ());