/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global'],function(q){"use strict";var S={};S.CSS_CLASS="sapMSelectList";S.render=function(r,l){var C=S.CSS_CLASS;r.write("<ul");r.writeControlData(l);r.addClass(C);if(!l.getEnabled()){r.addClass(C+"Disabled");}r.addStyle("width",l.getWidth());r.addStyle("max-width",l.getMaxWidth());r.writeStyles();r.writeClasses();this.writeAccessibilityState(r,l);r.write(">");this.renderItems(r,l);r.write("</ul>");};S.renderItems=function(r,l){var s=l.getItems().length,o=l.getSelectedItem();for(var i=0,I=l.getItems();i<I.length;i++){this.renderItem(r,l,I[i],{selected:o===I[i],setsize:s,posinset:i+1});}};S.renderItem=function(r,l,i,s){var e=i.getEnabled(),o=l.getSelectedItem(),C=S.CSS_CLASS,t=i.getTooltip_AsString();if(i instanceof sap.ui.core.Element){r.write("<li");r.writeElementData(i);if(i instanceof sap.ui.core.SeparatorItem){r.addClass(C+"SeparatorItem");}else{r.addClass(C+"Item");if(!e){r.addClass(C+"ItemDisabled");}if(e&&sap.ui.Device.system.desktop){r.addClass(C+"ItemHoverable");}if(i===o){r.addClass(C+"ItemSelected");}if(e){r.writeAttribute("tabindex","0");}}r.writeClasses();if(t){r.writeAttributeEscaped("title",t);}this.writeItemAccessibilityState.apply(this,arguments);r.write(">");r.writeEscaped(i.getText());r.write("</li>");}};S.writeAccessibilityState=function(r,l){r.writeAccessibilityState({role:"listbox"});};S.writeItemAccessibilityState=function(r,l,i,s){var R=(i instanceof sap.ui.core.SeparatorItem)?"separator":"option";r.writeAccessibilityState(i,{role:R,selected:s.selected,setsize:s.setsize,posinset:s.posinset});};return S;},true);
