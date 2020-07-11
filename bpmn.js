/*

	bpmn.js

	a business process modeler
	based on morphic.js

	written by Jens Mönig
	jens@moenig.org

	Copyright (C) 2020 by Jens Mönig

	bpmn.js is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as
	published by the Free Software Foundation, either version 3 of
	the License, or (at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.


	prerequisites:
	--------------
	needs morphic.js


	hierarchy
	---------
	the following tree lists all constructors hierarchically,
	indentation indicating inheritance. Refer to this list to get a
	contextual overview:

		Morph*
            BoxMorph*
                BPM_AnchorMorph
                BPM_EventMorph
                BPM_TaskMorph
                    BPM_GatewayMorph
                        BPM_ParallelGatewayMorph
                BPM_LaneMorph
            BPM_SequenceFlowMorph
                BPM_DataFlowMorph
            BPM_SymbolMorph
                BPM_DataMorph
                    BPM_LiteralMorph

	* from morphic.js


	toc
	---
	the following list shows the order in which all constructors are
	defined. Use this list to locate code in this document:

        BPM_AnchorMorph
        BPM_TaskMorph
        BPM_GatewayMorph
        BPM_ParallelGatewayMorph
        BPM_EventMorph
        BPM_SequenceFlowMorph
        BPM_LaneMorph
        BPM_SymbolMorph
        BPM_DataMorph
        BPM_LiteralMorph
        BPM_DataFlowMorph
*/

/*global modules, WorldMorph, BoxMorph, TextMorph, Point, Color, MenuMorph,
isNil, Morph, newCanvas, radians, nop, detect, StringMorph*/

// Global stuff ////////////////////////////////////////////////////////

modules.bpmn = '2020-July-11';

var BPM_AnchorMorph;
var BPM_EventMorph;
var BPM_GatewayMorph;
var BPM_ParallelGatewayMorph;
var BPM_TaskMorph;
var BPM_SequenceFlowMorph;
var BPM_LaneMorph;
var BPM_SymbolMorph;
var BPM_DataMorph;
var BPM_DataFlowMorph;
var BPM_LiteralMorph;

WorldMorph.prototype.customMorphs = function () {
	// add examples to the world's demo menu

	return [
    /*
        new BPM_TaskMorph(),
        new BPM_TaskMorph(
            'General\nOrder\nMangagement\nSupervision\nProcess'
        ),
        new BPM_GatewayMorph(),
        new BPM_EventMorph('start'),
        new BPM_EventMorph('stop')
    */
	];

};

Morph.prototype.tweakMenu = function (aMenu) {
    var handle;
    handle = setInterval(function () {
        aMenu.destroy();
        clearInterval(handle);
    }, 500);
    aMenu.mouseEnter = function () {
        clearInterval(handle);
    };
    aMenu.mouseLeave = function () {
        handle = setInterval(function () {
            aMenu.destroy();
            clearInterval(handle);
        }, 500);
    };
};

// BPM_AnchorMorph ///////////////////////////////////////////////////

// BPM_AnchorMorph inherits from BoxMorph:

BPM_AnchorMorph.prototype = new BoxMorph();
BPM_AnchorMorph.prototype.constructor = BPM_AnchorMorph;
BPM_AnchorMorph.uber = BoxMorph.prototype;

// BPM_AnchorMorph instance creation:

function BPM_AnchorMorph() {
    this.flow = null;
	BPM_AnchorMorph.uber.init.call(this, 10, 5);
	this.color = new Color(150, 150, 255);
    this.setExtent(new Point(20, 20));
}

// events

BPM_AnchorMorph.prototype.justDropped = function () {
    if (!(this.parent instanceof BPM_TaskMorph ||
            this.parent instanceof BPM_EventMorph ||
            this.parent instanceof BPM_GatewayMorph)) {
        this.flow.source.disconnectOutbound();
        this.flow.target = null;
        this.flow.destroy();
        this.destroy();
    }
};

BPM_TaskMorph.prototype.prepareToBeGrabbed = function () {
    if (this.flow) {
        this.flow.startStepping();
    }
};

// BPM_TaskMorph ///////////////////////////////////////////////////

// BPM_TaskMorph inherits from BoxMorph:

BPM_TaskMorph.prototype = new BoxMorph();
BPM_TaskMorph.prototype.constructor = BPM_TaskMorph;
BPM_TaskMorph.uber = BoxMorph.prototype;

// BPM_TaskMorph instance creation:

function BPM_TaskMorph(labelText) {
	this.init(labelText);
}

BPM_TaskMorph.prototype.init = function (labelText) {
    this.label = null;
    this.inbound = [];
    this.outbound = null;
    this.inputs = [];
    this.outputs = [];

	BPM_TaskMorph.uber.init.call(this, 7, 1);
    this.isDraggable = true;
	this.color = new Color(136, 143, 0);
    this.borderColor = this.color.darker(70);
    this.createLabel(labelText || 'Task');
    this.fixLayout();
};

BPM_TaskMorph.prototype.createLabel = function (string) {
    if (this.label) {this.label.destroy(); }
    this.label = new TextMorph(
        string,
        null, // font size
        null, // font style
        true, // bold
        null, // italic
        'center', // alignment
        null, // width
        null, // font name
        new Point(-1, -1), // shadow offset
        this.color.darker(50) // shadow color
    );
    this.add(this.label);
    this.label.setColor(new Color(255, 255, 255));
};

BPM_TaskMorph.prototype.fullCopy = function () {
    return new BPM_TaskMorph(this.label.text);
};

BPM_TaskMorph.prototype.layoutChanged = function () {
    this.fixLayout();
};

BPM_TaskMorph.prototype.fixLayout = function () {
    this.setExtent(new Point(
        this.label.width() + this.edge * 2,
        this.label.height() + this.edge * 2
    ));
    this.label.setCenter(this.center());
};

BPM_TaskMorph.prototype.userMenu = function () {
	var menu = new MenuMorph(this);
    menu.addItem('edit label...', 'editLabel');
	menu.addItem(
		"duplicate",
		function () {
			this.fullCopy().pickUp(this.world());
		},
		'make a copy\nand pick it up'
	);
	menu.addItem("delete", 'destroy');
    menu.addLine();
    if (this.outbound === null) {
        menu.addItem('connect...', 'connect');
        menu.addItem('next task...', 'addNextTask');
        menu.addItem('gateway...', 'addGateway');
        menu.addItem('parallel gateway...', 'addParallelGateway');
        menu.addItem('terminate...', 'addStopEvent');
    } else {
        menu.addItem('disconnect next', 'disconnectOutbound');
    }
    menu.addLine();
    menu.addItem('add input...', 'addInput');
    menu.addItem('add output...', 'addOutput');
    if (this.inputs.length + this.outputs.length > 0) {
        menu.addLine();
        if (this.inputs.length > 0) {
            menu.addItem('disconnect inputs', 'disconnectInputs');
        }
        if (this.outputs.length > 0) {
            menu.addItem('disconnect outputs', 'disconnectOutputs');
        }
    }
	return menu;
};

BPM_TaskMorph.prototype.destroy = function () {
    if (this.outbound) {
        this.disconnectOutbound();
    }
    this.inbound.forEach(function (flow) {
        flow.source.disconnectOutbound();
    });
    this.disconnectInputs();
    this.disconnectOutputs();
    BPM_TaskMorph.uber.destroy.call(this);
};

BPM_TaskMorph.prototype.editLabel = function () {
    this.label.isEditable = true;
    this.label.alignment = 'left';
    this.label.enableSelecting();
    this.label.edit();
    this.label.selectAll();
};

BPM_TaskMorph.prototype.connect = function () {
    var world = this.world(),
        anchor = new BPM_AnchorMorph(),
        flow = new BPM_SequenceFlowMorph(this, anchor);
    this.outbound = flow;
    anchor.flow = flow;
    world.add(flow);
    flow.startStepping();
    anchor.setPosition(world.hand.position());
    anchor.pickUp(world);
};

BPM_TaskMorph.prototype.addNextTask = function () {
    var world = this.world(),
        task = new BPM_TaskMorph(),
        flow = new BPM_SequenceFlowMorph(this, task);
    this.outbound = flow;
    task.inbound.push(flow);
    world.add(flow);
    task.setPosition(world.hand.position());
    task.pickUp(world);
};

BPM_TaskMorph.prototype.addGateway = function () {
    var world = this.world(),
        task = new BPM_GatewayMorph(),
        flow = new BPM_SequenceFlowMorph(this, task);
    this.outbound = flow;
    task.inbound.push(flow);
    world.add(flow);
    task.setPosition(world.hand.position());
    task.pickUp(world);
};

BPM_TaskMorph.prototype.addParallelGateway = function () {
    var world = this.world(),
        task = new BPM_ParallelGatewayMorph(),
        flow = new BPM_SequenceFlowMorph(this, task);
    this.outbound = flow;
    task.inbound.push(flow);
    world.add(flow);
    task.setPosition(world.hand.position());
    task.pickUp(world);
};

BPM_TaskMorph.prototype.addStopEvent = function () {
    var world = this.world(),
        task = new BPM_EventMorph('stop'),
        flow = new BPM_SequenceFlowMorph(this, task);
    this.outbound = flow;
    task.inbound.push(flow);
    world.add(flow);
    task.setPosition(world.hand.position());
    task.pickUp(world);
};

BPM_TaskMorph.prototype.addInput = function () {
    var world = this.world(),
        data = new BPM_DataMorph(),
        flow = new BPM_DataFlowMorph(data, this);
    this.inputs.push(flow);
    data.outbound.push(flow);
    world.add(flow);
    data.setPosition(world.hand.position());
    data.pickUp(world);
};

BPM_TaskMorph.prototype.addOutput = function () {
    var world = this.world(),
        data = new BPM_DataMorph(),
        flow = new BPM_DataFlowMorph(this, data);
    this.outputs.push(flow);
    data.inbound.push(flow);
    world.add(flow);
    data.setPosition(world.hand.position());
    data.pickUp(world);
};

BPM_TaskMorph.prototype.disconnectOutbound = function () {
    if (this.outbound.target.removeInbound) {
        this.outbound.target.removeInbound(this.outbound);
    }
    this.outbound.destroy();
    this.outbound = null;
};

BPM_TaskMorph.prototype.removeInbound = function (flow) {
    var idx = this.inbound.indexOf(flow);
    if (idx > -1) {
        this.inbound.splice(idx);
    }
};

BPM_TaskMorph.prototype.disconnectInputs = function () {
    this.inputs.forEach(function (flow) {
        flow.source.removeOutbound(flow);
        flow.destroy();
    });
    this.inputs = [];
};

BPM_TaskMorph.prototype.disconnectOutputs = function () {
    this.outputs.forEach(function (flow) {
        flow.target.removeInbound(flow);
        flow.destroy();
    });
    this.outputs = [];
};

BPM_TaskMorph.prototype.removeInput = function (flow) {
    var idx = this.inputs.indexOf(flow);
    if (idx > -1) {
        this.inputs.splice(idx);
    }
};

BPM_TaskMorph.prototype.removeOutput = function (flow) {
    var idx = this.outputs.indexOf(flow);
    if (idx > -1) {
        this.outputs.splice(idx);
    }
};

// testing

BPM_TaskMorph.prototype.isUpLoop = function () {
    if (this.isSelfLoop()) {return true; }
    if (this.isBackLoop() && !(this.isBelowAllInbound())) {return true; }
    if (!this.outbound) {return false; }
    if (this.outbound.target.left() < this.right()) {
        return this.outbound.target.bottom() < this.top() &&
            this.isBelowAllInbound();
    }
    return false;
};

BPM_TaskMorph.prototype.isDownLoop = function () {
    var y, trgt;
    if (this.isBackLoop() && this.isBelowAllInbound()) {return true; }
    if (!this.outbound) {return false; }
    y = this.center().y;
    trgt = this.outbound.target;
    if (trgt.left() < this.right()) {
        return trgt.top() > this.bottom() &&
            this.isAboveAllInbound();
    }
    return false;
};

BPM_TaskMorph.prototype.isBackLoop = function () {
    var y, trgt;
    if (!this.outbound) {return false; }
    y = this.center().y;
    trgt = this.outbound.target;
    if (trgt.left() < this.right()) {
        return trgt.bottom() > y && trgt.top() < y;
    }
    return false;
};

BPM_TaskMorph.prototype.isSelfLoop = function () {
    var self,
        out = this.outbound;
    self = detect(
        this.inbound,
        function (flow) {
            return flow === out;
        }
    );
    return self !== null;
};

BPM_TaskMorph.prototype.isBelowAllInbound = function () {
    var notBelow = detect(
        this.inbound,
        function (flow) {
            return flow.start.y >= flow.end.y;
        }
    );
    return this.inbound.length > 0 && !notBelow;
};

BPM_TaskMorph.prototype.isAboveAllInbound = function () {
    var notAbove = detect(
        this.inbound,
        function (flow) {
            return flow.start.y <= flow.end.y;
        }
    );
    return this.inbound.length > 0 && !notAbove;
};

// events

BPM_TaskMorph.prototype.reactToEdit = function () {
    this.label.isEditable = false;
    this.label.clearSelection();
    this.label.disableSelecting();
    this.label.alignment = 'center';
    this.label.fixLayout();
    this.label.changed();
};

BPM_TaskMorph.prototype.mouseEnter = function () {
    var menu;
    if (this.world().isDevMode) {return; }
    if (!isNil(this.world().hand.children[0])) {return; }
    menu = this.userMenu();
    menu.popup(this.world(), this.topRight().add(new Point(5, 0)));
    this.tweakMenu(menu);
};

BPM_TaskMorph.prototype.mouseLeave = function () {
    var menu;
    if (this.world().isDevMode) {return; }
    if (!isNil(this.world().hand.children[0])) {return; }
    menu = this.userMenu();
    menu.popup(this.world(), this.topRight().add(new Point(5, 0)));
    this.tweakMenu(menu);
};

BPM_TaskMorph.prototype.wantsDropOf = function (aMorph) {
    return aMorph instanceof BPM_AnchorMorph;
};

BPM_TaskMorph.prototype.reactToDropOf = function (aMorph) {
    if (!(aMorph instanceof BPM_AnchorMorph)) {return; }
    if (aMorph.flow instanceof BPM_DataFlowMorph) {
        if (aMorph.flow.isInput()) {
            aMorph.flow.target = this;
            this.inputs.push(aMorph.flow);
        } else {
            aMorph.flow.source = this;
            this.outputs.push(aMorph.flow);
        }
    } else if (aMorph.flow instanceof BPM_SequenceFlowMorph) {
        aMorph.flow.target = this;
        this.inbound.push(aMorph.flow);
    }
    aMorph.destroy();
};

BPM_TaskMorph.prototype.prepareToBeGrabbed = function () {
    if (this.outbound) {
        this.outbound.startStepping();
    }
    this.inbound.forEach(function (flow) {
        flow.startStepping();
    });
    this.inputs.forEach(function (flow) {
        flow.startStepping();
    });
    this.outputs.forEach(function (flow) {
        flow.startStepping();
    });
};

BPM_TaskMorph.prototype.justDropped = function () {
    if (this.outbound) {
        this.outbound.stopStepping();
    }
    this.inbound.forEach(function (flow) {
        flow.stopStepping();
    });
    this.inputs.forEach(function (flow) {
        flow.stopStepping();
    });
    this.outputs.forEach(function (flow) {
        flow.stopStepping();
    });
};

// drawing

BPM_TaskMorph.prototype.render = function (ctx) {
	var gradient;

	if ((this.edge === 0) && (this.border === 0)) {
		BoxMorph.uber.render.call(this, ctx);
		return null;
	}

    gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        this.height()
    );
    gradient.addColorStop(0, this.color.lighter(20).toString());
    gradient.addColorStop(1, this.color.darker(20).toString());

	ctx.fillStyle = gradient;
	ctx.beginPath();
	this.outlinePath(
		ctx,
		Math.max(this.edge - this.border, 0),
		this.border
	);
	ctx.closePath();
	ctx.fill();


    gradient = ctx.createLinearGradient(
        0,
        this.height(),
        0,
        0
    );
    gradient.addColorStop(0, this.borderColor.toString());
    gradient.addColorStop(1, this.color.lighter(80).toString());
	if (this.border > 0) {
		ctx.lineWidth = this.border;
		ctx.strokeStyle = gradient;
		ctx.beginPath();
		this.outlinePath(ctx, this.edge, this.border / 2);
		ctx.closePath();
		ctx.stroke();
	}
};

// BPM_GatewayMorph ///////////////////////////////////////////////////

// BPM_GatewayMorph inherits from BPM_TaskMorph:

BPM_GatewayMorph.prototype = new BPM_TaskMorph();
BPM_GatewayMorph.prototype.constructor = BPM_GatewayMorph;
BPM_GatewayMorph.uber = BPM_TaskMorph.prototype;

// BPM_GatewayMorph preferences settings:

BPM_GatewayMorph.prototype.angle = 30;

// BPM_GatewayMorph instance creation:

function BPM_GatewayMorph(labelText) {
	this.init(labelText);
}

BPM_GatewayMorph.prototype.init = function (labelText) {
    this.fork = null;

	BPM_GatewayMorph.uber.init.call(this, labelText || 'Gateway');
	this.color = new Color(194, 129, 0);
    this.borderColor = this.color.darker(70);
    this.fixLayout();
};

BPM_GatewayMorph.prototype.fullCopy = function () {
    return new BPM_GatewayMorph(this.label.text);
};

BPM_GatewayMorph.prototype.fixLayout = function () {
    var angle = this.angle,
        center = this.center(),
        h = Math.tan(radians(angle)) * (this.label.width() / 2),
        w = Math.tan(radians(90 - angle)) * (this.label.height() / 2);

    this.setExtent(new Point(
        this.label.width() + w * 2 + this.edge * 2,
        this.label.height() + h * 2 + this.edge * 2
    ));
    this.label.setCenter(this.center());
    this.setCenter(center);
};

BPM_GatewayMorph.prototype.userMenu = function () {
	var menu = BPM_GatewayMorph.uber.userMenu.call(this);
    menu.addLine();
    if (this.fork === null) {
        menu.addItem('connect condition...', 'connectFork');
        menu.addItem('conditional task...', 'addForkTask');
        menu.addItem('conditional gateway...', 'addForkGateway');
        menu.addItem(
            'conditional parallel gateway...',
            'addForkParallelGateway'
        );
        menu.addItem('terminate condition...', 'addForkStopEvent');
    } else {
        menu.addItem('disconnect...', 'disconnectOutbound');
    }
	return menu;
};

BPM_GatewayMorph.prototype.destroy = function () {
    this.disconnectOutbound();
    BPM_GatewayMorph.uber.destroy.call(this);
};


BPM_GatewayMorph.prototype.connectFork = function () {
    var world = this.world(),
        anchor = new BPM_AnchorMorph(),
        flow = new BPM_SequenceFlowMorph(this, anchor);
    this.fork = flow;
    anchor.flow = flow;
    world.add(flow);
    flow.startStepping();
    anchor.setPosition(world.hand.position());
    anchor.pickUp(world);
};

BPM_GatewayMorph.prototype.addForkTask = function () {
    var world = this.world(),
        task = new BPM_TaskMorph(),
        flow = new BPM_SequenceFlowMorph(this, task);
    this.fork = flow;
    task.inbound.push(flow);
    world.add(flow);
    task.setPosition(world.hand.position());
    task.pickUp(world);
};

BPM_GatewayMorph.prototype.addForkGateway = function () {
    var world = this.world(),
        task = new BPM_GatewayMorph(),
        flow = new BPM_SequenceFlowMorph(this, task);
    this.fork = flow;
    task.inbound.push(flow);
    world.add(flow);
    task.setPosition(world.hand.position());
    task.pickUp(world);
};

BPM_GatewayMorph.prototype.addForkParallelGateway = function () {
    var world = this.world(),
        task = new BPM_ParallelGatewayMorph(),
        flow = new BPM_SequenceFlowMorph(this, task);
    this.fork = flow;
    task.inbound.push(flow);
    world.add(flow);
    task.setPosition(world.hand.position());
    task.pickUp(world);
};

BPM_GatewayMorph.prototype.addForkStopEvent = function () {
    var world = this.world(),
        task = new BPM_EventMorph('stop'),
        flow = new BPM_SequenceFlowMorph(this, task);
    this.fork = flow;
    task.inbound.push(flow);
    world.add(flow);
    task.setPosition(world.hand.position());
    task.pickUp(world);
};

BPM_GatewayMorph.prototype.disconnectOutbound = function () {
    if (this.outbound) {
        if (this.outbound.removeInbound) {
            this.outbound.target.removeInbound(this.outbound);
        }
        this.outbound.destroy();
        this.outbound = null;
    }
    if (this.fork) {
        if (this.fork.target.removeInbound) {
            this.fork.target.removeInbound(this.outbound);
        }
        this.fork.destroy();
        this.fork = null;
    }
};

// testing

BPM_GatewayMorph.prototype.isUpLoop = function () {
    return false;
};

BPM_GatewayMorph.prototype.isDownLoop = function () {
    return false;
};

BPM_GatewayMorph.prototype.isBackLoop = function () {
    return false;
};

// events:

BPM_GatewayMorph.prototype.prepareToBeGrabbed = function () {
    BPM_GatewayMorph.uber.prepareToBeGrabbed.call(this);
    if (this.fork) {
        this.fork.startStepping();
    }
};

BPM_GatewayMorph.prototype.justDropped = function () {
    BPM_GatewayMorph.uber.justDropped.call(this);
    if (this.fork) {
        this.fork.stopStepping();
    }
};

// drawing:

BPM_GatewayMorph.prototype.outlinePath = function (ctx, radius, inset) {
	var	w = this.width(),
		h = this.height();
    nop(radius);
    ctx.moveTo(w / 2, inset);
    ctx.lineTo(w - inset, h / 2);
    ctx.lineTo(w / 2, h - inset);
    ctx.lineTo(inset, h / 2);
};

// BPM_ParallelGatewayMorph /////////////////////////////////////////////////

// BPM_ParallelGatewayMorph inherits from BPM_GatewayMorph:

BPM_ParallelGatewayMorph.prototype = new BPM_GatewayMorph();
BPM_ParallelGatewayMorph.prototype.constructor = BPM_ParallelGatewayMorph;
BPM_ParallelGatewayMorph.uber = BPM_GatewayMorph.prototype;

// BPM_ParallelGatewayMorph instance creation:

function BPM_ParallelGatewayMorph() {
	this.init();
}

BPM_ParallelGatewayMorph.prototype.fixLayout = function () {
    var padding = 4;
    this.setExtent(new Point(
        this.label.width() + padding + this.edge * 2,
        this.label.height() + padding + this.edge * 2
    ));
    this.label.setCenter(this.center());
};

BPM_ParallelGatewayMorph.prototype.init = function () {
	BPM_ParallelGatewayMorph.uber.init.call(this, '\u254B'); // '+'
    this.outbound = [];
    delete this.fork;
    this.fixLayout();
};

BPM_ParallelGatewayMorph.prototype.fullCopy = function () {
    return new BPM_ParallelGatewayMorph();
};


BPM_ParallelGatewayMorph.prototype.userMenu = function () {
	var menu = new MenuMorph(this);
	menu.addItem(
		"duplicate",
		function () {
			this.fullCopy().pickUp(this.world());
		},
		'make a copy\nand pick it up'
	);
	menu.addItem("delete", 'destroy');
    menu.addLine();
    menu.addItem('connect fork...', 'connect');
    menu.addItem('add fork...', 'addNextTask');
    menu.addItem('add gateway...', 'addGateway');
    menu.addItem('add parallel gateway...', 'addParallelGateway');
    menu.addItem('add termination...', 'addStopEvent');
    if (this.outbound.length > 0) {
        menu.addLine();
        menu.addItem('disconnect all forks', 'disconnectOutbound');
    }
	return menu;
};

// menu actions

BPM_ParallelGatewayMorph.prototype.connect = function () {
    var world = this.world(),
        anchor = new BPM_AnchorMorph(),
        flow = new BPM_SequenceFlowMorph(this, anchor);
    this.outbound.push(flow);
    anchor.flow = flow;
    world.add(flow);
    flow.startStepping();
    anchor.setPosition(world.hand.position());
    anchor.pickUp(world);
};

BPM_ParallelGatewayMorph.prototype.addNextTask = function () {
    var world = this.world(),
        task = new BPM_TaskMorph(),
        flow = new BPM_SequenceFlowMorph(this, task);
    this.outbound.push(flow);
    task.inbound.push(flow);
    world.add(flow);
    task.setPosition(world.hand.position());
    task.pickUp(world);
};

BPM_ParallelGatewayMorph.prototype.addGateway = function () {
    var world = this.world(),
        task = new BPM_GatewayMorph(),
        flow = new BPM_SequenceFlowMorph(this, task);
    this.outbound.push(flow);
    task.inbound.push(flow);
    world.add(flow);
    task.setPosition(world.hand.position());
    task.pickUp(world);
};

BPM_ParallelGatewayMorph.prototype.addParallelGateway = function () {
    var world = this.world(),
        task = new BPM_ParallelGatewayMorph(),
        flow = new BPM_SequenceFlowMorph(this, task);
    this.outbound.push(flow);
    task.inbound.push(flow);
    world.add(flow);
    task.setPosition(world.hand.position());
    task.pickUp(world);
};

BPM_ParallelGatewayMorph.prototype.addStopEvent = function () {
    var world = this.world(),
        task = new BPM_EventMorph('stop'),
        flow = new BPM_SequenceFlowMorph(this, task);
    this.outbound.push(flow);
    task.inbound.push(flow);
    world.add(flow);
    task.setPosition(world.hand.position());
    task.pickUp(world);
};

BPM_ParallelGatewayMorph.prototype.disconnectOutbound = function () {
    this.outbound.forEach(function (flow) {
        if (flow.target.removeInbound) {
            flow.target.removeInbound(flow);
        }
        flow.destroy();
    });
    this.outbound = [];
};

// events:

BPM_ParallelGatewayMorph.prototype.prepareToBeGrabbed = function () {
    this.inbound.forEach(function (flow) {
        flow.startStepping();
    });
    this.outbound.forEach(function (flow) {
        flow.startStepping();
    });
};

BPM_ParallelGatewayMorph.prototype.justDropped = function () {
    this.inbound.forEach(function (flow) {
        flow.stopStepping();
    });
    this.outbound.forEach(function (flow) {
        flow.stopStepping();
    });
};

// BPM_EventMorph ///////////////////////////////////////////////////

// BPM_EventMorph inherits from BoxMorph
// and pseudo-inherits form BPM_TaskMorph

BPM_EventMorph.prototype = new BoxMorph();
BPM_EventMorph.prototype.constructor = BPM_EventMorph;
BPM_EventMorph.uber = BoxMorph.prototype;

// BPM_EventMorph instance creation:

function BPM_EventMorph(typeString) {
	this.init(typeString);
}

BPM_EventMorph.prototype.init = function (typeString) {
    this.type = typeString || 'start'; // 'stop'
    this.inbound = [];
    this.outbound = null;

	BPM_EventMorph.uber.init.call(this, 15, 1);
    this.isDraggable = true;

    if (this.type === 'stop') {
        this.edge = 14;
        this.border = 2;
        this.color = new Color(184, 55, 0);
    } else if (this.type === 'start') {
        this.edge = 15;
        this.border = 1;
        this.color = new Color(8, 163, 0);
    }
    this.borderColor = this.color.darker(70);
    this.setExtent(new Point(30, 30));
};

BPM_EventMorph.prototype.userMenu = function () {
	var menu = new MenuMorph(this);
    if (this.type === 'stop') {
        menu.addItem("delete", 'destroy');
    } else {
        menu.addItem("help", 'nop');
    }
    if (this.type === 'start') {
        menu.addLine();
        menu.addItem('new lane', 'addLane');
        menu.addItem('new data', 'addData');
        menu.addItem('new literal', 'addLiteral');
        menu.addLine();
        if (this.outbound === null) {
            menu.addItem('connect...', 'connect');
            menu.addItem('next task...', 'addNextTask');
            menu.addItem('gateway...', 'addGateway');
            menu.addItem('parallel gateway...', 'addParallelGateway');
            menu.addItem('terminate...', 'addStopEvent');
        } else {
            menu.addItem('disconnect next', 'disconnectOutbound');
        }
    }
	return menu;
};

BPM_EventMorph.prototype.addLane = function () {
    new BPM_LaneMorph().pickUp(this.world());
};

BPM_EventMorph.prototype.addData = function () {
    new BPM_DataMorph().pickUp(this.world());
};

BPM_EventMorph.prototype.addLiteral = function () {
    new BPM_LiteralMorph().pickUp(this.world());
};

// pseudo-inherited methods

BPM_EventMorph.prototype.destroy
    = BPM_TaskMorph.prototype.destroy;

BPM_EventMorph.prototype.connect
    = BPM_TaskMorph.prototype.connect;

BPM_EventMorph.prototype.addNextTask
    = BPM_TaskMorph.prototype.addNextTask;

BPM_EventMorph.prototype.addGateway
    = BPM_TaskMorph.prototype.addGateway;

BPM_EventMorph.prototype.addParallelGateway
    = BPM_TaskMorph.prototype.addParallelGateway;

BPM_EventMorph.prototype.addStopEvent
    = BPM_TaskMorph.prototype.addStopEvent;

BPM_EventMorph.prototype.disconnectOutbound
    = BPM_TaskMorph.prototype.disconnectOutbound;

BPM_EventMorph.prototype.removeInbound
    = BPM_TaskMorph.prototype.removeInbound;

// testing

BPM_EventMorph.prototype.isUpLoop
    = BPM_TaskMorph.prototype.isUpLoop;

BPM_EventMorph.prototype.isDownLoop
    = BPM_TaskMorph.prototype.isDownLoop;

BPM_EventMorph.prototype.isSelfLoop
    = BPM_TaskMorph.prototype.isSelfLoop;

BPM_EventMorph.prototype.isBackLoop
    = BPM_TaskMorph.prototype.isBackLoop;

BPM_EventMorph.prototype.isBelowAllInbound
    = BPM_TaskMorph.prototype.isBelowAllInbound;

BPM_EventMorph.prototype.isAboveAllInbound
    = BPM_TaskMorph.prototype.isAboveAllInbound;

// events

BPM_EventMorph.prototype.mouseEnter
    = BPM_TaskMorph.prototype.mouseEnter;

BPM_EventMorph.prototype.mouseLeave
    = BPM_TaskMorph.prototype.mouseLeave;

BPM_EventMorph.prototype.wantsDropOf = function (aMorph) {
    if (this.type === 'stop') {
        return aMorph instanceof BPM_AnchorMorph;
    }
    return false;
};

BPM_EventMorph.prototype.reactToDropOf
    = BPM_TaskMorph.prototype.reactToDropOf;

BPM_EventMorph.prototype.prepareToBeGrabbed = function () {
    if (this.outbound) {
        this.outbound.startStepping();
    }
    this.inbound.forEach(function (flow) {
        flow.startStepping();
    });
};

BPM_EventMorph.prototype.justDropped = function () {
    if (this.outbound) {
        this.outbound.stopStepping();
    }
    this.inbound.forEach(function (flow) {
        flow.stopStepping();
    });
};

// drawing

BPM_EventMorph.prototype.render
    = BPM_TaskMorph.prototype.render;

// BPM_SequenceFlowMorph ///////////////////////////////////////////////////

// BPM_SequenceFlowMorph inherits from Morph:

BPM_SequenceFlowMorph.prototype = new Morph();
BPM_SequenceFlowMorph.prototype.constructor = BPM_SequenceFlowMorph;
BPM_SequenceFlowMorph.uber = Morph.prototype;

// BPM_SequenceFlowMorph instance creation:

function BPM_SequenceFlowMorph(source, target) {
    this.radius = 10;
	this.init(source, target);
}

BPM_SequenceFlowMorph.prototype.init = function (source, target) {
    this.source = source;
    this.target = target;
    this.start = null;
    this.end = null;
    this.path = [];
    this.lineWidth = 4;

	BPM_SequenceFlowMorph.uber.init.call(this);
	this.color = new Color(255, 255, 255);
    this.alpha = 0.7;
    this.fixLayout();
};

BPM_SequenceFlowMorph.prototype.fixLayout = function () {
    var seg = 20, x, y, p1, p2, startPoint, endPoint,
        head = 8 + this.lineWidth,
        radius = this.radius,
        r2 = radius / 2,
        path = [];

    if (!(this.source && this.target)) {return; }

    function addConditionAnchor(point) {
        path.push(new Point(point.x, point.y + r2));
        path.push(new Point(point.x + r2, point.y));
        path.push(new Point(point.x, point.y - r2));
        path.push(new Point(point.x - r2, point.y));
    }

    if (this.target instanceof BPM_ParallelGatewayMorph) {
        y = this.target.center().y;
        if (y > this.source.top() && (y < this.source.bottom())) { // straight
            startPoint = new Point(this.source.right(), y);
            path.push(startPoint);
        } else {
            if (this.target.left() < this.source.right()) {
                startPoint = this.source.rightCenter();
                path.push(startPoint);
                path.push(new Point(
                    this.source.right() + seg - radius,
                    this.source.center().y
                ));
                if (y > this.source.bottom()) { // down
                    y = (this.target.top() - this.source.bottom()) / 2;
                    path.push(new Point(
                        this.source.right() + seg,
                        this.source.center().y + radius
                    ));
                    path.push(new Point(
                        this.source.right() + seg,
                        this.source.bottom() + y - radius
                    ));
                    path.push(new Point( // turn left
                        this.source.right() + seg - radius,
                        this.source.bottom() + y
                    ));
                    path.push(new Point(
                        this.target.left() - seg + radius,
                        this.source.bottom() + y
                    ));
                    path.push(new Point( // turn down
                        this.target.left() - seg,
                        this.source.bottom() + y + radius
                    ));
                    path.push(new Point(
                        this.target.left() - seg,
                        this.target.center().y - radius
                    ));
                    path.push(new Point( // turn right
                        this.target.left() - seg + radius,
                        this.target.center().y
                    ));
                } else { // up
                    y = (this.source.top() - this.target.bottom()) / 2;
                    path.push(new Point(
                        this.source.right() + seg,
                        this.source.center().y - radius
                    ));
                    path.push(new Point(
                        this.source.right() + seg,
                        this.source.top() - y + radius
                    ));
                    path.push(new Point( // turn left
                        this.source.right() + seg - radius,
                        this.source.top() - y
                    ));
                    path.push(new Point(
                        this.target.left() - seg + radius,
                        this.source.top() - y
                    ));
                    path.push(new Point( // turn up
                        this.target.left() - seg,
                        this.source.top() - y - radius
                    ));
                    path.push(new Point(
                        this.target.left() - seg,
                        this.target.center().y + radius
                    ));
                    path.push(new Point( // turn right
                        this.target.left() - seg + radius,
                        this.target.center().y
                    ));
                }
            } else {
                x = (this.target.left() - this.source.right()) / 2;
                startPoint = this.source.rightCenter();
                path.push(startPoint);
                path.push(new Point(
                    this.source.right() + x - radius,
                    this.source.center().y
                ));
                if (y < startPoint.y) { // up
                    path.push(new Point(
                        this.source.right() + x,
                        this.source.center().y - radius
                    ));
                    path.push(new Point(
                        this.source.right() + x,
                        y + radius
                    ));
                    path.push(new Point(
                        this.source.right() + x + radius,
                        y
                    ));
                } else { // down
                    path.push(new Point(
                        this.source.right() + x,
                        this.source.center().y + radius
                    ));
                    path.push(new Point(
                        this.source.right() + x,
                        y - radius
                    ));
                    path.push(new Point(
                        this.source.right() + x + radius,
                        y
                    ));
                }
            }
        }
        endPoint = this.target.leftCenter();
        path.push(endPoint.subtract(new Point(head, 0)));
    } else if (this.source.isUpLoop()) {
        startPoint = this.source.bottomCenter();
        path.push(startPoint);
        path.push(new Point(
            startPoint.x,
            startPoint.y + seg - radius
        ));
        path.push(new Point(
            startPoint.x - radius,
            startPoint.y + seg
        ));
        path.push(new Point(
            this.target.left() - seg + radius,
            startPoint.y + seg
        ));
        path.push(new Point(
            this.target.left() - seg,
            startPoint.y + seg - radius
        ));
        path.push(new Point(
            this.target.left() - seg,
            this.target.center().y + radius
        ));
        path.push(new Point(
            this.target.left() - seg + radius,
            this.target.center().y
        ));
        endPoint = this.target.leftCenter();
        path.push(endPoint.subtract(new Point(head, 0)));
    } else if (this.source.isDownLoop()) {
        startPoint = this.source.topCenter();
        path.push(startPoint);
        path.push(new Point(
            startPoint.x,
            startPoint.y - seg + radius
        ));
        path.push(new Point(
            startPoint.x - radius,
            startPoint.y - seg
        ));
        path.push(new Point(
            this.target.left() - seg + radius,
            startPoint.y - seg
        ));
        path.push(new Point(
            this.target.left() - seg,
            startPoint.y - seg + radius
        ));
        path.push(new Point(
            this.target.left() - seg,
            this.target.center().y - radius
        ));
        path.push(new Point(
            this.target.left() - seg + radius,
            this.target.center().y
        ));
        endPoint = this.target.leftCenter();
        path.push(endPoint.subtract(new Point(head, 0)));
    } else {

        if (this.target.center().y < this.source.top() ||
                this.target.center().y > this.source.bottom()) {
            // connect at source bottom or top
            if (this.target.center().y < this.source.center().y) {
                startPoint = this.source.topCenter();
                if (this.isConditionalFlow()) {
                    addConditionAnchor(startPoint);
                }
                path.push(startPoint);
                if (this.target.left() > this.source.center().x) {
                    path.push(new Point(
                        this.source.center().x,
                        this.target.center().y + radius
                    ));
                    path.push(new Point(
                        this.source.center().x + radius,
                        this.target.center().y
                    ));
                } else {
                    y = (this.source.top() - this.target.bottom()) / 2;
                    path.push(new Point(
                        this.source.center().x,
                        this.source.top() - y + radius
                    ));
                    path.push(new Point(
                        this.source.center().x - radius,
                        this.source.top() - y
                    ));
                    x = this.source.center().x - this.target.left() + seg;
                    path.push(new Point(
                        this.source.center().x - x + radius,
                        this.source.top() - y
                    ));
                    path.push(new Point(
                        this.source.center().x - x,
                        this.source.top() - y - radius
                    ));
                    path.push(new Point(
                        this.target.left() - seg,
                        this.target.center().y + radius
                    ));
                    path.push(new Point(
                        this.target.left() - seg + radius,
                        this.target.center().y
                    ));
                }
            } else {
                startPoint = this.source.bottomCenter();
                if (this.isConditionalFlow()) {
                    addConditionAnchor(startPoint);
                }
                path.push(startPoint);
                if (this.target.left() > this.source.center().x) {
                    path.push(new Point(
                        this.source.center().x,
                        this.target.center().y - radius
                    ));
                    path.push(new Point(
                        this.source.center().x + radius,
                        this.target.center().y
                    ));
                } else {
                    y = (this.target.top() - this.source.bottom()) / 2;
                    path.push(new Point(
                        this.source.center().x,
                        this.source.bottom() + y - radius
                    ));
                    path.push(new Point(
                        this.source.center().x - radius,
                        this.source.bottom() + y
                    ));
                    x = this.source.center().x - this.target.left() + seg;
                    path.push(new Point(
                        this.source.center().x - x + radius,
                        this.source.bottom() + y
                    ));
                    path.push(new Point(
                        this.source.center().x - x,
                        this.source.bottom() + y + radius
                    ));
                    path.push(new Point(
                        this.target.left() - seg,
                        this.target.center().y - radius
                    ));
                    path.push(new Point(
                        this.target.left() - seg + radius,
                        this.target.center().y
                    ));
                }
            }
            // connector
            endPoint = this.target.leftCenter();
            path.push(endPoint.subtract(new Point(head, 0)));
        } else { // connect at source right
            if (this.target instanceof BPM_GatewayMorph &&
                    !(this.source instanceof BPM_GatewayMorph)) {
                startPoint = new Point(
                    this.source.right(),
                    this.target.center().y
                );
                if (this.isConditionalFlow()) {
                    addConditionAnchor(startPoint);
                }
                path.push(startPoint);

            } else if (this.target instanceof BPM_GatewayMorph &&
                    this.source instanceof BPM_GatewayMorph &&
                    Math.abs(
                        this.target.center().y - this.source.center().y
                    ) < radius) {
                startPoint = new Point(
                    this.source.right(),
                    this.target.center().y
                );
                if (this.isConditionalFlow()) {
                    addConditionAnchor(startPoint);
                }
                path.push(startPoint);
            } else {
                startPoint = this.source.rightCenter();
                if (this.isConditionalFlow()) {
                    addConditionAnchor(startPoint);
                }
                path.push(startPoint);
                if (!(this.target instanceof BPM_GatewayMorph) &&
                        this.target.top() < this.source.center().y &&
                        this.target.bottom() > this.source.center().y) {
                    endPoint = new Point(
                        this.target.left(),
                        this.source.center().y
                    );
                } else {
                    x = (this.target.left() - this.source.right()) / 2;
                    y = (this.target.center().y - this.source.center().y) / 2;
                    path.push(new Point(
                        this.source.right() + x - radius,
                        this.source.center().y
                    ));
                    if (y > 0) { // down
                        path.push(new Point(
                            this.source.right() + x,
                            this.source.center().y + radius
                        ));
                        path.push(new Point(
                            this.source.right() + x,
                            this.target.center().y - radius
                        ));
                    } else if (y < 0) { // up
                        path.push(new Point(
                            this.source.right() + x,
                            this.source.center().y - radius
                        ));
                        path.push(new Point(
                            this.source.right() + x,
                            this.target.center().y + radius
                        ));
                    }
                    path.push(new Point(
                        this.target.left() - x + radius,
                        this.target.center().y
                    ));
                }
            }
            // connector
            endPoint = endPoint || this.target.leftCenter();
            path.push(endPoint.subtract(new Point(head, 0)));
        }
    }
    // arrow head
    path.push(endPoint.subtract(new Point(head, head / 2)));
    path.push(endPoint.subtract(new Point(head, -head / 2)));
    path.push(endPoint);

    p1 = path[0];
    p2 = path[0];
    path.forEach(function (point) {
        p1 = p1.min(point);
        p2 = p2.max(point);
    });

    this.start = startPoint;
    this.end = endPoint;
    this.path = path;
    this.changed();
    this.bounds = p1.corner(p2).expandBy(this.lineWidth);

    // add shadow
    this.removeShadow();
    this.addShadow(new Point(1, 1), 0.5);
};

BPM_SequenceFlowMorph.prototype.render = function (ctx) {
    var points, i, pos = this.position(), r = this.radius;
    if (this.path.length === 0) {return; }
    ctx.strokeStyle = this.color.toString();
    ctx.lineWidth = this.lineWidth;
    ctx.fillStyle = ctx.strokeStyle;
    points = this.path.map(function (pt) {
        return pt.subtract(pos);
    });

    function rightUp(pt) {
        ctx.arc(
            pt.x,
            pt.y - r,
            r,
            radians(90),
            radians(0),
            true
        );
    }

    function rightDown(pt) {
        ctx.arc(
            pt.x,
            pt.y + r,
            r,
            radians(-90),
            radians(-0),
            false
        );
    }

    function leftUp(pt) {
        ctx.arc(
            pt.x,
            pt.y - r,
            r,
            radians(90),
            radians(180),
            false
        );
    }

    function leftDown(pt) {
        ctx.arc(
            pt.x,
            pt.y + r,
            r,
            radians(-90),
            radians(-180),
            true
        );
    }

    function upRight(pt) {
        ctx.arc(
            pt.x + r,
            pt.y,
            r,
            radians(-180),
            radians(-90),
            false
        );
    }

    function upLeft(pt) {
        ctx.arc(
            pt.x - r,
            pt.y,
            r,
            radians(-0),
            radians(-90),
            true
        );
    }

    function downRight(pt) {
        ctx.arc(
            pt.x + r,
            pt.y,
            r,
            radians(180),
            radians(90),
            true
        );
    }

    function downLeft(pt) {
        ctx.arc(
            pt.x - r,
            pt.y,
            r,
            radians(0),
            radians(90),
            false
        );
    }

    function drawSegment(index) {
        var point = points[index],
            last = points[index - 1],
            before;
        if (point.x !== last.x && (point.y !== last.y)) {
            before = points[i - 2];
            if (before.y === last.y) { // horizontal
                if (before.x < last.x) { // right
                    if (point.y > last.y) { // down
                        rightDown(last);
                    } else { // up
                        rightUp(last);
                    }
                } else { // left
                    if (point.y > last.y) { // down
                        leftDown(last);
                    } else { // up
                        leftUp(last);
                    }
                }
            } else { // vertical
                if (last.y < before.y) { // up
                    if (point.x > last.x) { // right
                        upRight(last);
                    } else { // left
                        upLeft(last);
                    }
                } else { // down
                    if (point.x > last.x) { // right
                        downRight(last);
                    } else { // left
                        downLeft(last);
                    }
                }
            }

            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    }

    // line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    i = 1;
    if (this.isConditionalFlow()) {
        for (i = 1; i < 4; i += 1) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.fill();
        ctx.moveTo(points[4].x, points[4].y);
        i = 5;
    }

    for (i; i < points.length - 3; i += 1) {
        drawSegment(i);
    }
    ctx.stroke();

    // arrow head
    ctx.beginPath();
    ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.lineTo(points[points.length - 2].x, points[points.length - 2].y);
    ctx.lineTo(points[points.length - 3].x, points[points.length - 3].y);
    ctx.closePath();
    ctx.fill();
};

BPM_SequenceFlowMorph.prototype.isConditionalFlow = function () {
    if (this.source instanceof BPM_GatewayMorph) {
        return this.source.fork === this;
    }
    return false;
};

BPM_SequenceFlowMorph.prototype.startStepping = function () {
    var myself = this;
    this.step = function () {
        myself.fixLayout();
    };
};

BPM_SequenceFlowMorph.prototype.stopStepping = function () {
    this.step();
    delete this.step;
};

// BPM_LaneMorph ///////////////////////////////////////////////////

// BPM_LaneMorph inherits from BoxMorph:

BPM_LaneMorph.prototype = new BoxMorph();
BPM_LaneMorph.prototype.constructor = BPM_LaneMorph;
BPM_LaneMorph.uber = BoxMorph.prototype;

// BPM_LaneMorph instance creation:

function BPM_LaneMorph(labelText) {
	this.init(labelText);
}

BPM_LaneMorph.prototype.init = function (labelText) {
    this.label = null;

	BPM_LaneMorph.uber.init.call(this, 0, 0);
    this.isDraggable = true;
    this.acceptsDrops = true;
	this.color = new Color(0, 27, 81);
    this.alpha = 0.2;
    this.createLabel(labelText || 'Lane');
    this.setExtent(new Point(900, 80));
    this.fixLayout();
};

BPM_LaneMorph.prototype.createLabel
    = BPM_TaskMorph.prototype.createLabel;

BPM_LaneMorph.prototype.fullCopy = function () {
    return new BPM_LaneMorph(this.label.text);
};

BPM_LaneMorph.prototype.layoutChanged = function () {
    this.rerender();
};

BPM_LaneMorph.prototype.fixLayout = function () {
    if (!this.label) {return; }
    var padding = 5;
    this.bounds.setWidth(Math.max(
        this.width(),
        this.label.width() + padding * 2
    ));
    this.bounds.setHeight(Math.max(
        this.height(),
        this.label.height() + padding * 2
    ));
    this.label.setCenter(this.center());
    this.label.setLeft(this.left() + padding);
};

BPM_LaneMorph.prototype.userMenu = function () {
	var menu = new MenuMorph(this);
    menu.addItem('edit label...', 'editLabel');
	menu.addItem("resize", 'resize');
	menu.addItem("delete", 'destroy');
    return menu;
};

BPM_LaneMorph.prototype.destroy = function () {
    // first disconnect all submorphs
    BPM_LaneMorph.uber.destroy.call(this);
};

BPM_LaneMorph.prototype.editLabel = function () {
    this.label.isEditable = true;
    this.label.alignment = 'left';
    this.label.enableSelecting();
    this.label.edit();
    this.label.selectAll();
};

// events

BPM_LaneMorph.prototype.reactToEdit
    = BPM_TaskMorph.prototype.reactToEdit;

BPM_LaneMorph.prototype.prepareToBeGrabbed = function () {
    // be sure to step all connections
    this.children.forEach(function (child) {
        if (child.prepareToBeGrabbed) {
            child.prepareToBeGrabbed();
        }
    });
};

BPM_LaneMorph.prototype.justDropped = function () {
    // stop stepping all connections
    this.children.forEach(function (child) {
        if (child.justDropped) {
            child.justDropped();
        }
    });
};

// BPM_SymbolMorph //////////////////////////////////////////////////////////

/*
    I display graphical symbols, such as special letters. I have been
    called into existence out of frustration about not being able to
    consistently use Unicode characters to the same ends.
 */

// BPM_SymbolMorph inherits from Morph:

BPM_SymbolMorph.prototype = new Morph();
BPM_SymbolMorph.prototype.constructor = BPM_SymbolMorph;
BPM_SymbolMorph.uber = Morph.prototype;

// BPM_SymbolMorph instance creation:

function BPM_SymbolMorph(name, size, color, shadowOffset, shadowColor) {
	this.init(name, size, color, shadowOffset, shadowColor);
}

BPM_SymbolMorph.prototype.init = function (
    name,
    size,
    color,
    shadowOffset,
    shadowColor
) {
	this.name = name || 'data'; // square
	this.size = size || ((size === 0) ? 0 : 50);
	this.shadowOffset = shadowOffset || new Point(0, 0);
	this.shadowColor = shadowColor || null;

	BPM_SymbolMorph.uber.init.call(this);
	this.color = color || new Color(0, 0, 0);
    this.fixLayout();
};

// BPM_SymbolMorph displaying:

BPM_SymbolMorph.prototype.fixLayout = function () {
    this.bounds.setExtent(new Point(
        this.symbolWidth(), this.size
    ));
};

BPM_SymbolMorph.prototype.render = function (ctx) {
    var x, y, sx, sy;
    sx = this.shadowOffset.x < 0 ? 0 : this.shadowOffset.x;
    sy = this.shadowOffset.y < 0 ? 0 : this.shadowOffset.y;
    x = this.shadowOffset.x < 0 ? Math.abs(this.shadowOffset.x) : 0;
    y = this.shadowOffset.y < 0 ? Math.abs(this.shadowOffset.y) : 0;
    if (this.shadowColor) {
        ctx.drawImage(
            this.symbolCanvasColored(this.shadowColor),
            sx,
            sy
        );
    }
    ctx.drawImage(
        this.symbolCanvasColored(this.color),
        x,
        y
    );
};

BPM_SymbolMorph.prototype.symbolCanvasColored = function (aColor) {
    // private
    var canvas = newCanvas(new Point(this.symbolWidth(), this.size));
    switch (this.name) {
    case 'data':
        return this.drawSymbolSheet(canvas, aColor);
    case 'input':
        return this.drawSymbolInput(canvas, aColor);
    case 'output':
        return this.drawSymbolOutput(canvas, aColor);
    default:
        return canvas;
    }
};

BPM_SymbolMorph.prototype.symbolWidth = function () {
    // private
    var size = this.size;
    switch (this.name) {
    case 'data':
    case 'input':
    case 'output':
        return size * 0.8;
    default:
        return this.size;
    }
};

BPM_SymbolMorph.prototype.drawSymbolSheet = function (canvas, color) {
    // answer a canvas showing a paper sheet symbol
    var ctx = canvas.getContext('2d'),
        w = Math.min(canvas.width, canvas.height) / 3;

    ctx.fillStyle = color.toString();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width - w, 0);
    ctx.lineTo(canvas.width - w, w);
    ctx.lineTo(canvas.width, w);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();

/*
    ctx.shadowBlur = 3;
    ctx.shadowColor = color.darker(75).toString();
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;
*/
    ctx.fillStyle = color.darker(30).toString();
    ctx.beginPath();
    ctx.moveTo(canvas.width - w, 0);
    ctx.lineTo(canvas.width, w);
    ctx.lineTo(canvas.width - w, w);
    ctx.lineTo(canvas.width - w, 0);
    ctx.closePath();
    ctx.fill();
/*
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
*/
    return canvas;
};

BPM_SymbolMorph.prototype.drawSymbolInput = function (canvas, color) {
    // answer a canvas showing a paper sheet symbol with an arrow
    var ctx,
        padding = 2,
        w = canvas.width / 2;
    this.drawSymbolSheet(canvas, color);
    ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    this.drawArrow(ctx, w, padding);
    ctx.stroke();
    return canvas;
};

BPM_SymbolMorph.prototype.drawSymbolOutput = function (canvas, color) {
    // answer a canvas showing a paper sheet symbol with an arrow
    var ctx,
        padding = 2,
        w = canvas.width / 2;
    this.drawSymbolSheet(canvas, color);
    ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    this.drawArrow(ctx, w, padding);
    ctx.fill();
    return canvas;
};

BPM_SymbolMorph.prototype.drawArrow = function (ctx, w, padding) {
    // private
    ctx.beginPath();
    ctx.moveTo(padding, w / 2 + padding);
    ctx.lineTo(padding, w / 3 + padding);
    ctx.lineTo(w / 2 + padding, w / 3 + padding);
    ctx.lineTo(w / 2 + padding, padding);
    ctx.lineTo(w + padding, w / 2 + padding);
    ctx.lineTo(w / 2 + padding, w + padding);
    ctx.lineTo(w / 2 + padding, w / 3 * 2 + padding);
    ctx.lineTo(padding, w / 3 * 2 + padding);
    ctx.closePath();
};

// BPM_DataMorph ///////////////////////////////////////////////////

// BPM_DataMorph inherits from SymbolMorph:

BPM_DataMorph.prototype = new BPM_SymbolMorph();
BPM_DataMorph.prototype.constructor = BPM_DataMorph;
BPM_DataMorph.uber = BPM_SymbolMorph.prototype;

// BPM_DataMorph instance creation:

function BPM_DataMorph(labelText) {
	this.init(labelText);
}

BPM_DataMorph.prototype.init = function (labelText) {
    this.label = null;
    this.inbound = [];
    this.outbound = [];

	BPM_DataMorph.uber.init.call(
        this,
        'data',
        22, // size
        new Color(255, 255, 255), // color
        new Point(1, 1), // shadow offset
        this.color.darker(80) // shadow color
    );
    this.isDraggable = true;
    this.changed();
    this.createLabel(labelText || 'Data');
    this.fixLayout();
};

BPM_DataMorph.prototype.createLabel = function (string) {
    if (this.label) {this.label.destroy(); }
    this.label = new TextMorph(
        string,
        10, // font size
        null, // font style
        false, // bold
        null, // italic
        'center', // alignment
        null, // width
        null, // font name
        new Point(1, 1), // shadow offset
        this.color.darker(80) // shadow color
    );
    this.add(this.label);
    this.label.isScrollable = false;
    this.label.setColor(new Color(255, 255, 255));
};

BPM_DataMorph.prototype.fullCopy = function () {
    return new BPM_DataMorph(this.label.text);
};

// BPM_DataMorph layout

BPM_DataMorph.prototype.layoutChanged = function () {
    this.fixLayout();
};

BPM_DataMorph.prototype.fixLayout = function () {
    BPM_DataMorph.uber.fixLayout.call(this);
    if (!this.label) {return; }
    this.label.setCenter(this.center());
    this.label.setTop(this.bottom());
};

// BPM_DataMorph menu

BPM_DataMorph.prototype.userMenu = function () {
	var menu = new MenuMorph(this);
    menu.addItem('edit label...', 'editLabel');
	menu.addItem(
		"duplicate",
		function () {
			this.fullCopy().pickUp(this.world());
		},
		'make a copy\nand pick it up'
	);
	menu.addItem("delete", 'destroy');
    menu.addLine();
    menu.addItem('connect to input', 'connectInput');
    menu.addItem('connect to output', 'connectOutput');
    if (this.inbound.length + this.outbound.length > 0) {
        menu.addLine();
        if (this.inbound.length > 0) {
            menu.addItem('disconnect inbounds', 'disconnectInbound');
        }
        if (this.outbound.length > 0) {
            menu.addItem('disconnect outbounds', 'disconnectOutbound');
        }
    }
	return menu;
};

BPM_DataMorph.prototype.destroy = function () {
    this.disconnectInbound();
    this.disconnectOutbound();
    BPM_TaskMorph.uber.destroy.call(this);
};

BPM_DataMorph.prototype.editLabel = function () {
    this.labelAnchor = this.label.position();
    BPM_TaskMorph.prototype.editLabel.call(this);
};

BPM_DataMorph.prototype.connectInput = function () {
    var world = this.world(),
        anchor = new BPM_AnchorMorph(),
        flow = new BPM_DataFlowMorph(this, anchor);
    this.outbound.push(flow);
    anchor.flow = flow;
    world.add(flow);
    flow.startStepping();
    anchor.setPosition(world.hand.position());
    anchor.pickUp(world);
};

BPM_DataMorph.prototype.connectOutput = function () {
    var world = this.world(),
        anchor = new BPM_AnchorMorph(),
        flow = new BPM_DataFlowMorph(anchor, this);
    this.inbound.push(flow);
    anchor.flow = flow;
    world.add(flow);
    flow.startStepping();
    anchor.setPosition(world.hand.position());
    anchor.pickUp(world);
};

BPM_DataMorph.prototype.disconnectInbound = function () {
    this.inbound.forEach(function (flow) {
        flow.source.removeOutput(flow);
        flow.destroy();
    });
    this.inbound = [];
};

BPM_DataMorph.prototype.disconnectOutbound = function () {
    this.outbound.forEach(function (flow) {
        flow.target.removeInput(flow);
        flow.destroy();
    });
    this.outbound = [];
};

BPM_DataMorph.prototype.removeInbound
    = BPM_TaskMorph.prototype.removeInbound;

BPM_DataMorph.prototype.removeOutbound = function (flow) {
    var idx = this.outbound.indexOf(flow);
    if (idx > -1) {
        this.outbound.splice(idx);
    }
};

// BPM_DataMorph events

BPM_DataMorph.prototype.reactToEdit = function () {
    BPM_TaskMorph.prototype.reactToEdit.call(this);
    this.labelAnchor = null;
    this.fixLayout();
};

BPM_DataMorph.prototype.mouseEnter
    = BPM_TaskMorph.prototype.mouseEnter;

BPM_DataMorph.prototype.mouseLeave
    = BPM_TaskMorph.prototype.mouseLeave;

// BPM_DataMorph drag & drop

BPM_DataMorph.prototype.prepareToBeGrabbed = function () {
    this.inbound.forEach(function (flow) {
        flow.startStepping();
    });
    this.outbound.forEach(function (flow) {
        flow.startStepping();
    });
};

BPM_DataMorph.prototype.justDropped = function () {
    this.inbound.forEach(function (flow) {
        flow.stopStepping();
    });
    this.outbound.forEach(function (flow) {
        flow.stopStepping();
    });
};

// BPM_LiteralMorph ///////////////////////////////////////////////////

// BPM_LiteralMorph inherits from BPM_DataMorph:

BPM_LiteralMorph.prototype = new BPM_DataMorph();
BPM_LiteralMorph.prototype.constructor = BPM_LiteralMorph;
BPM_LiteralMorph.uber = BPM_DataMorph.prototype;

// BPM_LiteralMorph instance creation:

function BPM_LiteralMorph(value) {
	this.init(value || '5');
}

BPM_LiteralMorph.prototype.createLabel = function (string) {
    if (this.label) {this.label.destroy(); }
    this.label = new StringMorph(string, 10);
    this.label.isNumeric = true;
    this.add(this.label);
    this.label.isEditable = true;
    this.label.enableSelecting();
};

BPM_LiteralMorph.prototype.fullCopy = function () {
    return new BPM_LiteralMorph(this.label.text);
};

// BPM_LiteralMorph layout

BPM_LiteralMorph.prototype.fixLayout = function () {
    this.bounds.setExtent(new Point(
        Math.max(this.width(), this.symbolWidth()) +
            Math.abs(this.shadowOffset.x),
        this.size + Math.abs(this.shadowOffset.y)
    ));
    if (!this.label) {
        return;
    }
    var padding = 2;
    this.bounds.setWidth(this.label.width() + padding * 2);
    this.label.setCenter(this.center());
    this.label.setBottom(this.bottom() - padding);
    this.changed();
};

// BPM_LiteralMorph displaying:

BPM_LiteralMorph.prototype.render = function (ctx) {
    var x, y, sx, sy;
    sx = this.shadowOffset.x < 0 ? 0 : this.shadowOffset.x;
    sy = this.shadowOffset.y < 0 ? 0 : this.shadowOffset.y;
    x = this.shadowOffset.x < 0 ? Math.abs(this.shadowOffset.x) : 0;
    y = this.shadowOffset.y < 0 ? Math.abs(this.shadowOffset.y) : 0;
    if (this.shadowColor) {
        ctx.drawImage(
            this.symbolCanvasColored(this.shadowColor),
            sx,
            sy
        );
    }
    ctx.drawImage(
        this.symbolCanvasColored(this.color),
        x,
        y
    );
};

BPM_LiteralMorph.prototype.symbolCanvasColored = function (aColor) {
    // private
    var canvas = newCanvas(new Point(
        Math.max(this.width(), this.symbolWidth()),
        this.size
    ));
    switch (this.name) {
    case 'data':
        return this.drawSymbolSheet(canvas, aColor);
    default:
        return canvas;
    }
};

// BPM_LiteralMorph menu


BPM_LiteralMorph.prototype.userMenu = function () {
	var menu = new MenuMorph(this);
	menu.addItem(
		"duplicate",
		function () {
			this.fullCopy().pickUp(this.world());
		},
		'make a copy\nand pick it up'
	);
	menu.addItem("delete", 'destroy');
    menu.addLine();
    menu.addItem('connect to input', 'connectInput');
    if (this.outbound.length > 0) {
        menu.addLine();
        menu.addItem('disconnect outbounds', 'disconnectOutbound');
    }
	return menu;
};

// BPM_LiteralMorph events

BPM_LiteralMorph.prototype.reactToEdit = function () {
    this.label.clearSelection();
};

BPM_LiteralMorph.prototype.mouseClickLeft = function () {
    this.label.edit();
    this.label.selectAll();
};

// BPM_DataFlowMorph ///////////////////////////////////////////////////

// BPM_DataFlowMorph inherits from BPM_SequenceFlowMorph:

BPM_DataFlowMorph.prototype = new BPM_SequenceFlowMorph();
BPM_DataFlowMorph.prototype.constructor = BPM_DataFlowMorph;
BPM_DataFlowMorph.uber = BPM_SequenceFlowMorph.prototype;

// BPM_DataFlowMorph instance creation:

function BPM_DataFlowMorph(source, target) {
	this.init(source, target);
}

BPM_DataFlowMorph.prototype.init = function (source, target) {
	BPM_DataFlowMorph.uber.init.call(this, source, target);
	this.color = new Color(255, 255, 255);
    this.lineWidth = 1;
    this.fixLayout();
};

BPM_DataFlowMorph.prototype.fixLayout = function () {
    var p1, p2, y, startPoint, endPoint,
        head = 5 + this.lineWidth,
        seg = 12,
        path = [];

    if (this.isInput()) {
        if (this.source.top() > this.target.bottom()) {
            // src below target
            y = (this.source.top() - this.target.bottom()) / 2;
            if (this.source.right() < this.target.left()) {
                // src left of trgt
                startPoint = this.source.rightCenter();
                path.push(startPoint);
                path.push(new Point(
                    this.target.left() + this.target.width() / 4,
                    this.source.center().y
                ));
            } else { // source right of trgt
                startPoint = this.source.topCenter();
                path.push(startPoint);
                path.push(new Point(
                    this.source.center().x,
                    this.source.top() - y
                ));
                path.push(new Point(
                    this.target.left() + this.target.width() / 4,
                    this.target.bottom() + y
                ));
            }
            // connector
            endPoint = new Point(
                this.target.left() + this.target.width() / 4,
                this.target.bottom()
            );
            path.push(endPoint);

            // arrow head
            path.push(endPoint.add(new Point(head / 2, head)));
            path.push(endPoint.add(new Point(-head / 2, head)));

        } else { // source is above target
            startPoint = this.source.rightCenter();
            path.push(startPoint);
            if (this.source.right() < this.target.left()) {
                // src left of trgt
                path.push(new Point(
                    this.target.left() + this.target.width() / 4,
                    this.source.center().y
                ));
            } else { // source right of trgt
                y = (this.target.top() - this.source.label.bottom()) / 2;
                seg = Math.max(
                    0,
                    this.source.label.right() - this.source.right()
                ) + seg;
                path.push(new Point(
                    this.source.right() + seg,
                    this.source.center().y
                ));
                path.push(new Point(
                    this.source.right() + seg,
                    this.source.label.bottom() + y
                ));
                path.push(new Point(
                    this.target.left() + this.target.width() / 4,
                    this.source.label.bottom() + y
                ));
            }
            // connector
            endPoint = new Point(
                this.target.left() + this.target.width() / 4,
                this.target.top()
            );
            path.push(endPoint);

            // arrow head
            path.push(endPoint.subtract(new Point(head / 2, head)));
            path.push(endPoint.subtract(new Point(-head / 2, head)));

        }
    } else { // if I'm an output
        startPoint = this.target.leftCenter();
        path.push(startPoint);

        // arrow head
        path.push(startPoint.subtract(new Point(head, head / 2)));
        path.push(startPoint.subtract(new Point(head, -head / 2)));

        // connector
        path.push(startPoint);

        if (this.target.top() > this.source.bottom()) {
            // dta below task
            if (this.target.left() < this.source.right()) {
                // dta left of task
                y = (this.target.top() - this.source.bottom()) / 2;
                path.push(new Point(
                    this.target.left() - seg,
                    this.target.center().y
                ));
                path.push(new Point(
                    this.target.left() - seg,
                    this.target.top() - y
                ));
                path.push(new Point(
                    this.source.right() - this.source.width() / 4,
                    this.target.top() - y
                ));
            } else {
                // dta right of task
                path.push(new Point(
                    this.source.right() - this.source.width() / 4,
                    this.target.center().y
                ));
            }
            path.push(new Point(
                this.source.right() - this.source.width() / 4,
                this.source.bottom()
            ));
        } else {
            // dta above task
            if (this.target.left() < this.source.right()) {
                // dta left of task
                y = (this.source.top() - this.target.label.bottom()) / 2;
                seg = Math.max(
                    0,
                    this.target.left() - this.target.label.left()
                ) + seg;
                path.push(new Point(
                    this.target.left() - seg,
                    this.target.center().y
                ));
                path.push(new Point(
                    this.target.left() - seg,
                    this.source.top() - y
                ));
                path.push(new Point(
                    this.source.right() - this.source.width() / 4,
                    this.source.top() - y
                ));
            } else {
                // dta right of task
                path.push(new Point(
                    this.source.right() - this.source.width() / 4,
                    this.target.center().y
                ));
            }
            path.push(new Point(
                this.source.right() - this.source.width() / 4,
                this.source.top()
            ));
        }
    }

    // determine my extent
    p1 = path[0];
    p2 = path[0];
    path.forEach(function (point) {
        p1 = p1.min(point);
        p2 = p2.max(point);
    });

    this.start = startPoint;
    this.end = endPoint;
    this.path = path;
    this.changed();
    this.bounds = p1.corner(p2).expandBy(this.lineWidth);
    this.changed();

    // add shadow
    this.removeShadow();
    this.addShadow(new Point(1, 1), 0.5);
};

BPM_DataFlowMorph.prototype.render = function (ctx) {
    var points, i,
        pos = this.position(),
        seg = this.lineWidth * 2;
    if (this.path.length === 0) {return; }
    ctx.strokeStyle = this.color.toString();
    ctx.lineWidth = this.lineWidth;
    ctx.lineCap = 'round';
    points = this.path.map(function (pt) {
        return pt.subtract(pos);
    });

    function drawSegment(startIndex, endIndex) {
        var startPoint = points[startIndex],
            endPoint = points[endIndex],
            dist,
            parts,
            count;
        if (startPoint.y === endPoint.y) { // move horizontally
            parts = Math.round((endPoint.x - startPoint.x) / seg);
            dist = parts < 0 ? -seg : seg;
            parts = Math.abs(parts);
            for (count = 1; count < parts; count += 2) {
                ctx.beginPath();
                ctx.moveTo(
                    startPoint.x + ((count - 1) * dist),
                    startPoint.y
                );
                ctx.lineTo(
                    startPoint.x + (count * dist),
                    startPoint.y
                );
                ctx.stroke();
            }
        } else if (startPoint.x === endPoint.x) { // move vertically
            parts = Math.round((endPoint.y - startPoint.y) / seg);
            dist = parts < 0 ? -seg : seg;
            parts = Math.abs(parts);
            for (count = 1; count < parts; count += 2) {
                ctx.beginPath();
                ctx.moveTo(
                    startPoint.x,
                    startPoint.y + ((count - 1) * dist)
                );
                ctx.lineTo(
                    startPoint.x,
                    startPoint.y + (count * dist)
                );
                ctx.stroke();
            }
        } else { // for debugging
            ctx.beginPath();
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(endPoint.x, endPoint.y);
            ctx.stroke();
        }
    }

    if (this.isInput()) {
        // line
        for (i = 1; i < points.length - 2; i += 1) {
            drawSegment(i - 1, i);
        }
        // arrow head
        ctx.beginPath();
        ctx.moveTo(
            points[points.length - 3].x,
            points[points.length - 3].y
        );
        ctx.lineTo(
            points[points.length - 2].x,
            points[points.length - 2].y
        );
        ctx.stroke();
        ctx.moveTo(
            points[points.length - 3].x,
            points[points.length - 3].y
        );
        ctx.lineTo(
            points[points.length - 1].x,
            points[points.length - 1].y
        );
        ctx.stroke();
    } else { // output
        // arrow head
        ctx.beginPath();
        ctx.moveTo(
            points[0].x,
            points[0].y
        );
        ctx.lineTo(
            points[1].x,
            points[1].y
        );
        ctx.stroke();
        ctx.moveTo(
            points[0].x,
            points[0].y
        );
        ctx.lineTo(
            points[2].x,
            points[2].y
        );
        ctx.stroke();
        // line
        for (i = 4; i < points.length; i += 1) {
            drawSegment(i - 1, i);
        }
    }
};

BPM_DataFlowMorph.prototype.startStepping = function () {
    var myself = this;
    this.step = function () {
        myself.fixLayout();
    };
};

BPM_DataFlowMorph.prototype.stopStepping = function () {
    this.step();
    delete this.step;
};

// DataFlowMorph testing

BPM_DataFlowMorph.prototype.isInput = function () {
    return this.source instanceof BPM_DataMorph ||
        this.target instanceof BPM_TaskMorph;
};
