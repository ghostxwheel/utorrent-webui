/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.m.Image.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control'],
	function(jQuery, library, Control) {
	"use strict";


	
	/**
	 * Constructor for a new Image.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A wrapper around the IMG tag. The image can be loaded from a remote or local server.
	 * 
	 * Density related image will be loaded if image with density awareness name in format [imageName]@[densityValue].[extension] is provided. The valid desity values are 1, 1.5, 2. If the original devicePixelRatio isn't one of the three valid numbers, it's rounded up to the nearest one.
	 * 
	 * There are various size setting options available, and the images can be combined with actions.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.28.10
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.Image
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Image = Control.extend("sap.m.Image", /** @lends sap.m.Image.prototype */ { metadata : {
	
		library : "sap.m",
		properties : {
	
			/**
			 * Relative or absolute path to URL where the image file is stored. The path will be adapted to the density aware format according to the density of the device following the convention that [imageName]@[densityValue].[extension]
			 */
			src : {type : "sap.ui.core.URI", group : "Data", defaultValue : null},
	
			/**
			 * When the empty value is kept, the original size is not changed. It is also possible to make settings for width or height only, the original ratio between width/height is maintained.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},
	
			/**
			 * When the empty value is kept, the original size is not changed. It is also possible to make settings for width or height only, the original ratio between width/height is maintained.
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},
	
			/**
			 * A decorative image is included for design reasons. Accessibility tools will ignore decorative images.
			 * 
			 * Note: If the Image has an image map (useMap is set), this property will be overridden (the image will not be rendered as decorative).
			 * A decorative image has no ALT attribute, so the Alt property is ignored if the image is decorative.
			 */
			decorative : {type : "boolean", group : "Accessibility", defaultValue : true},
	
			/**
			 * The alternative text that is displayed in case the Image is not available, or cannot be displayed.
			 * If the image is set to decorative this property is ignored.
			 */
			alt : {type : "string", group : "Accessibility", defaultValue : null},
	
			/**
			 * The name of the image map that defines the clickable areas
			 */
			useMap : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * If this is set to false, the src image will be loaded directly without attempting to fetch the density perfect image for high density device.
			 * 
			 * By default, this is set to true but then one or more requests are sent trying to get the density perfect version of image if this version of image doesn't exist on the server.
			 * 
			 * If bandwidth is the key for the application, set this value to false.
			 */
			densityAware : {type : "boolean", group : "Misc", defaultValue : true},
	
			/**
			 * The source property when this image is tapped.
			 */
			activeSrc : {type : "sap.ui.core.URI", group : "Data", defaultValue : ""}
		},
		events : {
	
			/**
			 * Event is fired when the user clicks on the control. (This event is deprecated, use the press event instead)
			 */
			tap : {}, 
	
			/**
			 * Event is fired when the user clicks on the control.
			 */
			press : {}
		}
	}});
	
	Image._currentDevicePixelRatio = (function() {
	
		// if devicePixelRatio property is not available, value 1 is assumed by default.
		var ratio = (window.devicePixelRatio === undefined ? 1 : window.devicePixelRatio);
	
		// for ratio in our library, only 1 1.5 2 are valid
		if (ratio <= 1) {
			ratio = 1;
		} else {
	
			// round it to the nearest valid value
			ratio *= 2;
			ratio = Math.round(ratio);
			ratio /= 2;
		}
	
		if (ratio > 2) {
			ratio = 2;
		}
	
		return ratio;
	}());
	
	/**
	 * Function is called when image is loaded successfully.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	Image.prototype.onload = function(oEvent) {	
		// This is used to fix the late load event handler problem on ios platform, if the event handler
		// has not been called right after image is loaded, event is triggered manually in onAfterRendering
		// method.
		if (!this._defaultEventTriggered) {
			this._defaultEventTriggered = true;
		}

		// reset the flag for the next rerendering
		this._bVersion2Tried = false;

		var $DomNode = this.$(),
			oDomRef = $DomNode[0];

		if (!this._isWidthOrHeightSet()) {
			if (this._iLoadImageDensity > 1) {
				if (($DomNode.width() === oDomRef.naturalWidth) && ($DomNode.height() === oDomRef.naturalHeight)) {
					$DomNode.width($DomNode.width() / this._iLoadImageDensity);
				}
			}
		}

		$DomNode.removeClass("sapMNoImg");
	};
	
	/**
	 * Function is called when error occurs during image loading.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	Image.prototype.onerror = function(oEvent) {
	
		// This is used to fix the late load event handler problem on ios platform, if the event handler
		// has not been called right after image is loaded with errors, event is triggered manually in onAfterRendering
		// method.
		if (!this._defaultEventTriggered) {
			this._defaultEventTriggered = true;
		}
	
		var $DomNode = this.$(),
			sCurrentSrc = $DomNode.attr("src"),
			d = Image._currentDevicePixelRatio;
	
		$DomNode.addClass("sapMNoImg");
	
		// if src is empty or there's no image existing, just stop
		if (!sCurrentSrc || this._iLoadImageDensity === 1) {
			return;
		}
	
		if (d === 2 || d < 1) {
	
			// load the default image
			this._iLoadImageDensity = 1;
			$DomNode.attr("src", this._generateSrcByDensity(this._isActiveState ? this.getActiveSrc() : this.getSrc(), 1));
		} else if (d === 1.5) {
			if (this._bVersion2Tried) {
				setTimeout(jQuery.proxy(function() {

					// if version 2 isn't on the server, load the default image
					this._iLoadImageDensity = 1;
					$DomNode.attr("src", this._generateSrcByDensity(this._isActiveState ? this.getActiveSrc() : this.getSrc(), 1));
				}, this), 0);
			} else {
				setTimeout(jQuery.proxy(function() {
	
					// special treatment for density 1.5
					// verify if the version for density 2 is provided or not
					this._iLoadImageDensity = 2;
					$DomNode.attr("src", this._generateSrcByDensity(this._isActiveState ? this.getActiveSrc() : this.getSrc(), 2));
					this._bVersion2Tried = true;
				}, this), 0);
			}
		}
	};
	
	/**
	 * This function is called to register event handlers for load and error event on the image DOM after it's rendered.
	 * It also check if the event handlers are called accordingly after the image is loaded, if not the event handlers are triggered
	 * manually.
	 *
	 * @private
	 */
	Image.prototype.onAfterRendering = function() {
	
		// if densityAware is set to true, we need to do extra steps for getting and resizing the density perfect version of the image.
		if (this.getDensityAware()) {
			var $DomNode = this.$();
	
			// bind the load and error event handler
			$DomNode.on("load", jQuery.proxy(this.onload, this));
			$DomNode.on("error", jQuery.proxy(this.onerror, this));
	
			var oDomRef = this.getDomRef();
	
			// if image has already been loaded and the load or error event handler hasn't been called, trigger it manually.
			if (oDomRef.complete && !this._defaultEventTriggered) {
	
				// need to use the naturalWidth property instead of jDomNode.width(),
				// the later one returns positive value even in case of broken image
				$DomNode.trigger(oDomRef.naturalWidth > 0 ? "load" : "error");	//  image loaded successfully or with error
			}
		}
	};
	
	/**
	 * This binds to the touchstart event to change the src property of the image to the activeSrc.
	 *
	 * @private
	 */
	Image.prototype.ontouchstart = function(oEvent) {
		if (oEvent.srcControl.mEventRegistry["press"] || oEvent.srcControl.mEventRegistry["tap"]) {
	
			// mark the event for components that needs to know if the event was handled by the Image
			oEvent.setMarked();
		}
	
		if (oEvent.targetTouches.length === 1 && this.getActiveSrc()) {
	
			// change the source only when the first finger is on the image, the following fingers doesn't affect
			this.$().attr("src", this._getDensityAwareActiveSrc());
			this._isActiveState = true;
		}
	};
	
	/**
	 * This changes the src property of the image back to the src property of the image control.
	 *
	 * @private
	 */
	Image.prototype.ontouchend = function(oEvent) {
		// change the source back only when all fingers leave the image
		// avoid setting the normal state src again when there's no activeSrc property set
		if (oEvent.targetTouches.length === 0 && this.getActiveSrc()) {
			this._isActiveState = false;
			this.$().attr("src", this._getDensityAwareSrc()).removeClass("sapMNoImg");
		}
	};
	
	/**
	 * This overrides the default setter of the src property and update the dom node.
	 *
	 * @param {sap.ui.core.URI} sSrc
	 * @public
	 */
	Image.prototype.setSrc = function(sSrc) {
		if (sSrc === this.getSrc()) {
			return;
		}
	
		this.setProperty("src", sSrc, true);
	
		var oDomRef = this.getDomRef();
		if (oDomRef) {
			this.$().attr("src", this._getDensityAwareSrc());
		}
	};
	
	/**
	 * This overrides the default setter of the activeSrc property in order to avoid the rerendering.
	 *
	 * @param {sap.ui.core.URI} sActiveSrc
	 * @public
	 */
	Image.prototype.setActiveSrc = function(sActiveSrc) {
		if (!sActiveSrc) {
			sActiveSrc = "";
		}
	
		this.setProperty("activeSrc", sActiveSrc, true);
	};
	
	/**
	 * Function is called when image is clicked.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	Image.prototype.ontap = function(oEvent) {
		this.fireTap({/* no parameters */}); //	(This event is deprecated, use the press event instead)
		this.firePress({/* no parameters */});
	};
	
	/**
	 * Handle the key up event for SPACE and ENTER.
	 *
	 * @param {jQuery.Event} oEvent - the keyboard event.
	 * @private
	 */
	Image.prototype.onkeyup = function(oEvent) {
		if (oEvent.which === jQuery.sap.KeyCodes.SPACE || oEvent.which === jQuery.sap.KeyCodes.ENTER) {
			this.firePress({/* no parameters */});
		}
	};
	
	/**
	 * Test if at least one of the width and height properties is set.
	 *
	 * @private
	 */
	Image.prototype._isWidthOrHeightSet = function() {
		return (this.getWidth() && this.getWidth() !== '') || (this.getHeight() && this.getHeight() !== '');
	};
	
	/**
	 * This function returns the density aware source based on the deviceDensityRatio value.
	 * The return value is in the format [src]@[densityValue].[extension] if the densityValue not equal 1, otherwise it returns the src property.
	 *
	 * @private
	 */
	Image.prototype._getDensityAwareSrc = function() {
		var d = Image._currentDevicePixelRatio,
			sSrc = this.getSrc();
	
		// this property is used for resizing the higher resolution image when image is loaded.
		this._iLoadImageDensity = d;
	
		// if devicePixelRatio equals 1 or densityAware set to false, simply return the src property
		if (d === 1 || !this.getDensityAware()) {
			return sSrc;
		}
	
		return this._generateSrcByDensity(sSrc, d);
	};
	
	/**
	 * This function returns the density aware version of the Active source base on the deviceDensityRatio value.
	 *
	 * @private
	 */
	Image.prototype._getDensityAwareActiveSrc = function() {
		var d = Image._currentDevicePixelRatio,
			sActiveSrc = this.getActiveSrc();
	
		// this property is used for resizing the higher resolution image when image is loaded.
		this._iLoadImageDensity = d;
	
		// if devicePixelRatio equals 1 or densityAware set to false, simply return the src property
		if (d === 1 || !this.getDensityAware()) {
			return sActiveSrc;
		}
	
		return this._generateSrcByDensity(sActiveSrc, d);
	};
	
	/**
	 * This function generates the density aware version of the src property according to the iDensity provided.
	 * It returns the density aware version of the src property.
	 *
	 * @private
	 */
	Image.prototype._generateSrcByDensity = function(sSrc, iDensity) {
		if (!sSrc) {
			return "";
		}
	
		// if src is in data uri format, disable the density handling
		if (this._isDataUri(sSrc)) {
			this._iLoadImageDensity = 1;
			return sSrc;
		}
	
		if (iDensity === 1) {
			return sSrc;
		}
	
		var iLastDotPos = sSrc.lastIndexOf("."),
			iLastSlashPos = sSrc.lastIndexOf("/"),
			sName = sSrc.substring(0, iLastDotPos),
			sExtension = sSrc.substring(iLastDotPos);
	
		// if there's no extension
		// or there's slash after the last dot, this means that the dot may come from the host name
		if (iLastDotPos === -1 || (iLastSlashPos > iLastDotPos)) {
			return sSrc + "@" + iDensity;
		}
	
		sName = sName + "@" + iDensity;
		return sName + sExtension;
	};
	
	Image.prototype._isDataUri = function(src) {
		return src ? src.indexOf("data:") === 0 : false;
	};

	return Image;

}, /* bExport= */ true);
