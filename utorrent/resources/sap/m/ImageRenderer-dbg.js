/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
 
// Provides default renderer for control sap.m.Image
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * Image renderer. 
	 * @author D051016
	 * @namespace
	 */
	var ImageRenderer = {
	};
	
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ImageRenderer.render = function(rm, oImage){
		// Open the <img> tag
		rm.write("<img");
	
		rm.writeAttributeEscaped("src", oImage._getDensityAwareSrc());
		rm.writeControlData(oImage);
		
		rm.addClass("sapMImg");
		if (oImage.hasListeners("press") || oImage.hasListeners("tap")) {
			rm.addClass("sapMPointer");
		}
		
		if (oImage.getUseMap() || !oImage.getDecorative()) {
			rm.addClass("sapMImgFocusable");
		}
		
		rm.writeClasses();
		
		//TODO need further discussion to decide if tooltip is still needed for mobile
		var tooltip = oImage.getTooltip_AsString();
		if (tooltip) {
			rm.writeAttributeEscaped("title", tooltip);
		}
	
		//TODO implement the ImageMap control
		var sUseMap = oImage.getUseMap();
		if (sUseMap) {
			if (!(jQuery.sap.startsWith(sUseMap, "#"))) {
				sUseMap = "#" + sUseMap;
			}
			rm.writeAttributeEscaped("useMap", sUseMap);
		}
		
		// determine tab index and write alt attribute - both depending on "decorative" state (which is overridden by the "useMap" property
		var myTabIndex = 0;
		if ((oImage.getDecorative() && (!sUseMap))) {
			myTabIndex = -1;
			rm.writeAttribute("role", "presentation");
			rm.write(" alt=''"); // accessibility requirement: write always empty alt attribute for decorative images
		} else {
			if (oImage.getAlt()) {
				rm.writeAttributeEscaped("alt", oImage.getAlt() || tooltip); // accessibility requirement: use tooltip for alt if alt is not set
			} else if (tooltip) {
				rm.writeAttributeEscaped("alt", tooltip);
			}
		}
		rm.writeAttribute("tabIndex", myTabIndex);
		
		// Dimensions
	
		if (oImage.getWidth() && oImage.getWidth() != '') {
			rm.addStyle("width", oImage.getWidth());
		}
		if (oImage.getHeight() && oImage.getHeight() != '') {
			rm.addStyle("height", oImage.getHeight());
		}
		rm.writeStyles();
		
		var sTooltip = oImage.getTooltip_AsString();
		if (sTooltip) {
			rm.writeAttributeEscaped("title", sTooltip);
		}
		
		rm.write(" />"); // close the <img> element
	};
	

	return ImageRenderer;

}, /* bExport= */ true);
