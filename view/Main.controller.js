sap.ui.controller("view.Main", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf view.Main
*/
	onInit: function() {
        var oEventBus = sap.ui.getCore().getEventBus();
        oEventBus.subscribe("app", "load", this.onLoad, this);
        
        this.oModel = new sap.ui.model.json.JSONModel();
        this.getView().setModel(this.oModel);
	},
	
	onRefresh : function () {
        var oEventBus = sap.ui.getCore().getEventBus();
        oEventBus.publish("app", "load", {});
	},
	
	onTorrentRemove: function(oEvent) {
	    var oList = oEvent.getSource().getParent();
	    var oContext = oList.getSwipedItem().getBindingContext();
	    var strHash = oContext.getProperty("0");
	    
	    jQuery.ajax({
	        url:"/gui/?token=" + window.token + "&action=remove&hash=" + strHash + "&t=" + Date.now() ,
			headers: {
				"Authorization": window.authorization
			},
	        success: function() {
	            this.onRefresh();
	        }.bind(this) ,
	        error: function() {
	            alert("Request denied");
	        }
	    });
	},
	
	onAddUrl: function() {
	    var strUrl = this.getView().byId("torrentUrl").getValue();
	    this.getView().byId("torrentUrl").setValue("");
	    
	    jQuery.ajax({
	        url:"/gui/?token=" + window.token + "&action=add-url&s=" + strUrl + "&t=" + Date.now() ,
			headers: {
				"Authorization": window.authorization
			},
	        success: function() {
	            this.onRefresh();
	        }.bind(this),
	        error: function() {
	            alert("Request denied");
	        }
	    });
	},
	
	onLoad: function() {
	    jQuery.ajax({
	        url:"/gui/?token=" + window.token + "&list=1",
			headers: {
				"Authorization": window.authorization
			},
	        success: function(oData) {
	            var oParsedData = JSON.parse(oData);
	            oParsedData.downloading = [];
	            
	            oParsedData.torrents.forEach(function(torrent, index, arr) {
	                if(torrent[21].search("Downloading") > -1 || torrent[21].search("Connecting to peers") > -1) {
	                    oParsedData.downloading.push(torrent);
	                    arr.splice(index, 1);
	                }
 	            });
				
				oParsedData.downloading.sort(function(el1, el2) {
					return el1[2].localeCompare(el2[2]);
				});
				
				oParsedData.torrents.sort(function(el1, el2) {
					return el1[2].localeCompare(el2[2]);
				});
	            
	            this.oModel.setData(oParsedData);
	            
	        }.bind(this)
	    });
	}

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf view.Main
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf view.Main
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf view.Main
*/
//	onExit: function() {
//
//	}

});