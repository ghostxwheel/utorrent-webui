/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["jquery.sap.global","./library","sap/ui/core/Item"],function(q,l,I){"use strict";var M=I.extend("sap.m.MessagePopoverItem",{metadata:{library:"sap.m",properties:{type:{type:"sap.ui.core.MessageType",group:"Appearance",defaultValue:sap.ui.core.MessageType.Error},title:{type:"string",group:"Misc"},description:{type:"string",group:"Misc"}}}});return M;},true);
