import * as go from 'gojs';
import {make_statements, make_links} from './cfg_to_gojs_obj';

var $ = go.GraphObject.make;
const myDiagram = $(go.Diagram, 'myDiagramDiv',  // must name or refer to the DIV HTML element
    {
        initialContentAlignment: go.Spot.Top,
        scrollsPageOnFocus: false,
        layout:
        $(go.TreeLayout,  // use a TreeLayout to position all of the nodes
            {
                treeStyle: go.TreeLayout.StyleLastParents,
                // properties for most of the tree:
                angle: 90,
                layerSpacing: 80,
                // properties for the "last parents":
                alternateAngle: 0,
                alternateAlignment: go.TreeLayout.AlignmentStart,
                alternateNodeIndent: 20,
                alternateNodeIndentPastParent: 1,
                alternateNodeSpacing: 20,
                alternateLayerSpacing: 40,
                alternateLayerSpacingParentOverlap: 1,
                alternatePortSpot: new go.Spot(0.001, 1, 20, 0),
                alternateChildPortSpot: go.Spot.Left
            }),
        'toolManager.mouseWheelBehavior': go.ToolManager.WheelZoom,
        'undoManager.isEnabled': true  // enable undo & redo
    });

// helper definitions for node templates
function nodeStyle() {
    return [
        // The Node.location comes from the 'loc' property of the node data,
        // converted by the Point.parse static method.
        // If the Node.location is changed, it updates the 'loc' property of the node data,
        // converting back using the Point.stringify static method.
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        {
            // the Node.location is at the center of each node
            locationSpot: go.Spot.Center
        }
    ];
}

// Define a function for creating a 'port' that is normally transparent.
// The 'name' is used as the GraphObject.portId,
// the 'align' is used to determine where to position the port relative to the body of the node,
// the 'spot' is used to control how links connect with the port and whether the port
// stretches along the side of the node,
// and the boolean 'output' and 'input' arguments control whether the user can draw links from or to the port.
// the port is basically just a transparent rectangle that stretches along the side of the node,
// and becomes colored when the mouse passes over it
function makePort(name, align, spot, output, input) {
    var horizontal = align.equals(go.Spot.Top) || align.equals(go.Spot.Bottom);
    return $(go.Shape,        {
        fill: 'transparent',  // changed to a color in the mouseEnter event handler
        strokeWidth: 0,  // no stroke
        width: horizontal ? NaN : 8,  // if not stretching horizontally, just 8 wide
        height: !horizontal ? NaN : 8,  // if not stretching vertically, just 8 tall
        alignment: align,  // align the port on the main Shape
        stretch: (horizontal ? go.GraphObject.Horizontal : go.GraphObject.Vertical),
        portId: name,  // declare this object to be a 'port'
        fromSpot: spot,  // declare where links may connect at this port
        fromLinkable: output,  // declare whether the user may draw links from here
        toSpot: spot,  // declare where links may connect at this port
        toLinkable: input,  // declare whether the user may draw links to here
        cursor: 'pointer',  // show a different cursor to indicate potential link point
        mouseEnter: function(e, port) {  // the PORT argument will be this Shape
            if (!e.diagram.isReadOnly) port.fill = 'rgba(255,0,255,0.5)';            },
        mouseLeave: function(e, port) {
            port.fill = 'transparent';            }        });
}

function textStyle() {
    return {
        font: '11pt Helvetica, Arial, sans-serif',
        stroke: 'whitesmoke'
    };
}

function textStyle2() {
    return {
        font: 'bold 12pt Helvetica, Arial, sans-serif'
    };
}

// define the Node templates for regular nodes
myDiagram.nodeTemplateMap.add('',  // the default category
    $(go.Node, 'Table', nodeStyle(),
        // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
        $(go.Panel, 'Auto',
            $(go.Shape, 'Rectangle',
                new go.Binding('fill','fill'),
                new go.Binding('figure', 'figure')),
            $(go.TextBlock, textStyle(),
                {
                    margin: 8,
                    maxSize: new go.Size(160, NaN),
                    wrap: go.TextBlock.WrapFit,
                    editable: true
                },
                new go.Binding('text').makeTwoWay())
        ),
        // four named ports, one on each side:
        makePort('T', go.Spot.Top, go.Spot.TopSide, false, true),
        makePort('L', go.Spot.Left, go.Spot.LeftSide, true, true),
        makePort('R', go.Spot.Right, go.Spot.RightSide, true, true),
        makePort('B', go.Spot.Bottom, go.Spot.BottomSide, true, false)
    ));

myDiagram.nodeTemplateMap.add('Conditional',
    $(go.Node, 'Table', nodeStyle(),
        $(go.Panel, 'Auto',
            $(go.Shape, 'Diamond',
                new go.Binding('fill','fill'),
                new go.Binding('figure', 'figure')),
            $(go.TextBlock, textStyle(),
                {
                    margin: 8,
                    maxSize: new go.Size(160, NaN),
                    wrap: go.TextBlock.WrapFit,
                    editable: true
                },
                new go.Binding('text').makeTwoWay())
        ),
        makePort('T', go.Spot.Top, go.Spot.Top, false, true),
        makePort('L', go.Spot.Left, go.Spot.Left, true, true),
        makePort('R', go.Spot.Right, go.Spot.Right, true, true),
        makePort('B', go.Spot.Bottom, go.Spot.Bottom, true, false)
    ));

myDiagram.nodeTemplateMap.add('Start',
    $(go.Node, 'Table', nodeStyle(),
        $(go.Panel, 'Auto',
            $(go.Shape, 'Circle',
                { minSize: new go.Size(40, 40), fill: '#79C900', strokeWidth: 0 }),
            $(go.TextBlock, 'Start', textStyle(),
                new go.Binding('text'))
        ),
        // three named ports, one on each side except the top, all output only:
        makePort('L', go.Spot.Left, go.Spot.Left, true, false),
        makePort('R', go.Spot.Right, go.Spot.Right, true, false),
        makePort('B', go.Spot.Bottom, go.Spot.Bottom, true, false)
    ));
    
myDiagram.nodeTemplateMap.add('Merge',
    $(go.Node, 'Table', nodeStyle(),
        $(go.Panel, 'Auto',
            $(go.Shape, 'Ellipse',
                new go.Binding('fill','fill'), 
                { width: 40, height: 30, fill: '#79C900', strokeWidth: 0 })
        ),
        // three named ports, one on each side except the top, all output only:
        makePort('L', go.Spot.Left, go.Spot.Left, true, false),
        makePort('R', go.Spot.Right, go.Spot.Right, true, false),
        makePort('B', go.Spot.Bottom, go.Spot.Bottom, true, false)
    ));
    
myDiagram.nodeTemplateMap.add('End',
    $(go.Node, 'Table', nodeStyle(),
        $(go.Panel, 'Auto',
            $(go.Shape, 'Circle',
                { minSize: new go.Size(40, 40), fill: '#DC3C00', strokeWidth: 0 }),
            $(go.TextBlock, 'End', textStyle(),
                new go.Binding('text'))
        ),
        // three named ports, one on each side except the bottom, all input only:
        makePort('T', go.Spot.Top, go.Spot.Top, false, true),
        makePort('L', go.Spot.Left, go.Spot.Left, false, true),
        makePort('R', go.Spot.Right, go.Spot.Right, false, true)
    ));

myDiagram.nodeTemplateMap.add('Comment',
    $(go.Node, 'Auto', nodeStyle(),
        $(go.Shape, 'File',
            { fill: '#EFFAB4', strokeWidth: 0 }),
        $(go.TextBlock, textStyle(),
            {
                margin: 5,
                maxSize: new go.Size(200, NaN),
                wrap: go.TextBlock.WrapFit,
                textAlign: 'center',
                editable: true,
                font: 'bold 12pt Helvetica, Arial, sans-serif',
                stroke: '#454545'
            },
            new go.Binding('text').makeTwoWay())
        // no ports, because no links are allowed to connect with a comment
    ));


// replace the default Link template in the linkTemplateMap
myDiagram.linkTemplate =
    $(go.Link,  // the whole link panel
        {
            routing: go.Link.AvoidsNodes,
            curve: go.Link.JumpOver,
            corner: 5, toShortLength: 4,
            relinkableFrom: true,
            relinkableTo: true,
            reshapable: true,
            resegmentable: true,
            // mouse-overs subtly highlight links:
            mouseEnter: function(e, link) { link.findObject('HIGHLIGHT').stroke = 'rgba(30,144,255,0.2)'; },
            mouseLeave: function(e, link) { link.findObject('HIGHLIGHT').stroke = 'transparent'; },
            selectionAdorned: false
        },
        new go.Binding('points').makeTwoWay(),
        $(go.Shape,  // the highlight shape, normally transparent
            { isPanelMain: true, strokeWidth: 8, stroke: 'transparent', name: 'HIGHLIGHT' }),
        $(go.Shape,  // the link path shape
            { isPanelMain: true, stroke: 'gray', strokeWidth: 2 },
            new go.Binding('stroke', 'isSelected', function(sel) { return sel ? 'dodgerblue' : 'gray'; }).ofObject()),
        $(go.Shape,  // the arrowhead
            { toArrow: 'standard', strokeWidth: 0, fill: 'gray'})
    );

myDiagram.linkTemplateMap.add('ConditionalLink',
    $(go.Link,  // the whole link panel
        {
            routing: go.Link.AvoidsNodes,
            curve: go.Link.JumpOver,
            corner: 5, toShortLength: 4,
            relinkableFrom: true,
            relinkableTo: true,
            reshapable: true,
            resegmentable: true,
            // mouse-overs subtly highlight links:
            mouseEnter: function(e, link) { link.findObject('HIGHLIGHT').stroke = 'rgba(30,144,255,0.2)'; },
            mouseLeave: function(e, link) { link.findObject('HIGHLIGHT').stroke = 'transparent'; },
            selectionAdorned: false
        },
        new go.Binding('points').makeTwoWay(),
        $(go.Shape,  // the highlight shape, normally transparent
            { isPanelMain: true, strokeWidth: 8, stroke: 'transparent', name: 'HIGHLIGHT' }),
        $(go.Shape,  // the link path shape
            { isPanelMain: true, stroke: 'gray', strokeWidth: 2 },
            new go.Binding('stroke', 'isSelected', function(sel) { return sel ? 'dodgerblue' : 'gray'; }).ofObject()),
        $(go.Shape,  // the arrowhead
            { toArrow: 'standard', strokeWidth: 0, fill: 'gray'}),
        $(go.Panel, 'Auto',
            { visible: true, name: 'LABEL', segmentIndex: 2, segmentFraction: 0.5},
            new go.Binding('visible', 'visible').makeTwoWay(),
            $(go.Shape, 'RoundedRectangle',  // the label shape
                { fill: '#F8F8F8', strokeWidth: 0 }),            
            $(go.TextBlock, textStyle2(), new go.Binding('text', 'text'))
        )
    ));

$(go.Overview, 'myOverviewDiv',  // the HTML DIV element for the Overview
    { observed: myDiagram, contentAlignment: go.Spot.Center });   // tell it which Diagram to show and pan

// temporary links used by LinkingTool and RelinkingTool are also orthogonal:
myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;

export function load(cfg, pred_array) {
    const toParse ={ 'class': 'go.GraphLinksModel',
        'linkFromPortIdProperty': 'fromPort',
        'linkToPortIdProperty': 'toPort',
        'nodeDataArray': make_statements(cfg, pred_array),
        'linkDataArray': make_links(cfg)};
    myDiagram.model = go.Model.fromJson(toParse);
}