sap.ui.controller("view.Login", {

	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf view.Login
	 */
	onInit: function() {
		this.oModel = new sap.ui.model.json.JSONModel({
			username: "admin",
			password: ""
		});

		this.getView().setModel(this.oModel);
	},

	onButtonLogin: function() {
		var strUsername = this.oModel.getProperty("/username");
		var strPassword = this.oModel.getProperty("/password");
		
		window.authorization = "Basic " + btoa(strUsername + ":" + strPassword);

		document.cookie = "GUID=;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
		jQuery.ajax({
			url: "/gui/token.html",
			headers: {
				"Authorization": window.authorization
			},
			success: function(strHtml) {
				window.token = jQuery(strHtml).getEncodedText();
				
				this._app.to("idMain");
				
                var oEventBus = sap.ui.getCore().getEventBus();
                oEventBus.publish("app", "load", {});
			}.bind(this)
		});
	}

	// 	doreq: function() {
	// 		window.utorrent.request("/gui/", null, {
	// 			list: 1
	// 		}, function(r) {
	// 			console.log("got resp", r);
	// 		});
	// 	}

	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller"s View is re-rendered
	 * (NOT before the first rendering! onInit() is used for that one!).
	 * @memberOf view.Login
	 */
	//	onBeforeRendering: function() {
	//
	//	},

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * @memberOf view.Login
	 */
	//	onAfterRendering: function() {
	//
	//	},

	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * @memberOf view.Login
	 */
	//	onExit: function() {
	//
	//	}

});