define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/window",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dijit/layout/ContentPane",//--
    "/pdojo/MotherGitHub/Mother/area.js"
], function(declare,lang,win,domStyle,domConstruct,ContentPane,area){
    return declare(area,{
        name:"",
        floatF:"nonFloat", //"nonFloat" => form in pane, "modal" =>modal floating form,  "nonModal" => floating form
        children:[],
        parentId:0,//id numer of the parent container or 0 if none 
        highestZIndex:null, //the zIndex of the child with higest zIndex
        dojoObject:null,
        type:"container",
        constructor: function(containerProperties){
           // The "constructor" method is special: the parent class areaWithText and area constructor are called automatically before this one.
            console.log("container class BEGIN OF CONSTRUCTOR");
            
            //REVIEW: Imported from MotherLib10 for speed
            var allPossibleProperties =
                {value:"", name:"", preCode:"", posCode:"", changeCode:"", title:"@|", headers:"", template:null, zIndex:0};
            declare.safeMixin(allPossibleProperties,this.left, this.top, this.width, this.height, this.zIndex);//priority to inherited defaults  
            if (containerProperties)
                declare.safeMixin(allPossibleProperties,containerProperties);
            console.log("INSIDE CONTAINER id="+this.id+" left="+this.left+" top="+this.top+" width="+this.width+" height="+this.height+" zIndex="+this.zIndex+" domId="+this.domId);
            
            if (this.zIndex>=0) {//if not a baseContainer
                var topZIndex=this.highestZIndexAreaUnderContainer({left: this.left,top: this.top,width: this.width,height: this.height});
                this.zIndex = topZIndex + 1;
            }
            var paneDivId="_PaneDiv" + this.id;
            var paneDiv = domConstruct.create("div");
            paneDiv.innerHTML="<div id='"+paneDivId+"'></div>";
            win.body().appendChild(paneDiv);//places paneDiv in DOM

            var paneStyleProperty = "position:absolute; left:" + this.left +"px;top:"+ this.top +"px;width:"+ this.width +"px;height:";
            paneStyleProperty+= this.height +"px; padding:0px; overflow: visible; border: "+ this.borderThickness +"px "+ this.borderStyle +" "+this.borderColor+";'";
            this.dojoObject = new ContentPane({ //x Pane is a form variable. we need this to do a this.xPane.startup() necessary for tabs - to avoid 3 bar probelm
                id: this.id,
                content: "",
                //style:'position:absolute;left:800px;top:5px;width:200px;height:30px;border: 1px dotted green;'
                style: paneStyleProperty
            }, paneDivId); //content Pane is placed over the div with name paneDivId

            console.log("container class END OF CONSTRUCTOR");
        },
        addExistingChild: function(childrenArr){
            for(var i = 0; i < this.children.length; i++){
                this.children[i].zIndex = this.zIndex+1;//initially all children have a zIndex 1 above their container
                this.children.push( this.children[i]);
            }
            // this.children = this.children.concat(childrenArr);
        },
        moveTo: function(newCoordinates){//overrides the area moveTo() method
            //declare.safeMixin(this.viewPort,newViewPort);
            var leftDelta = newCoordinates.left - this.left;
            var topDelta = newCoordinates.top - this.top;
            this.moveAllChildrenByDelta({left: leftDelta, top: topDelta});
            // declare.safeMixin({left: this.left, top: this.top}, newCoordinates);
            this.inherited(arguments);//the magic call to parent class
        },
        moveAllChildrenByDelta: function(deltaCoordinates){
            for(var i = 0; i < this.children.length; i++){
                this.children[i].moveTo({
                    left: this.children[i].left + deltaCoordinates.left,
                    top: this.children[i].top + deltaCoordinates.top});
            }
        },
        topAreaUnderPoint: function(pointLeft,pointTop){
            var topAreaIndex=-1;
            var topZIndexOfChildren=this.zIndex;//the container zIndex
            var topArea = this;
            for(var i = 0; i < this.children.length; i++){
                 if (this.children[i].isPointInsideArea(pointLeft,pointTop)) {
                    if(this.children[i].zIndex > topArea.zIndex) {
                            topArea = this.children[i];
                    }
                }
            }
        },
        highestZIndexAreaUnderContainer: function(areaDimensions){//given {left:xL, top:xT, width:xW, height:xH} returns highest zIndex inside
           var topZIndex = this.zIndex;
           for (var i = 0; i < this.children.length; i++) {
                 if (this.children[i].intersectsAreaDimensions(areaDimensions)) {
                    if(this.children[i].zIndex > topZIndex) {
                            topZIndex = this.children[i].zIndex;
                    }
                }
            }
            return topZIndex;
        },
        childDump: function() {
            var showContainerParentName = "Canvas Parent...";
            if (this.containerParent) {//most frequent case where area is inside a container
                showContainerParentName = "No name but id=" + this.containerParent.id;
                if (this.containerParent.name)
                    showContainerParentName = this.containerParent.name;
            }
            console.log ("%%%%%%%%%%%%%%%%%%%%%%%%%%% container name="+ this.name+" id="+this.id+" parentContainerName="+showContainerParentName+"%%%%%%%%%%%%%%%%%%%%%%%%%");
            for (var i = 0; i < this.children.length; i++) {
                console.log(i+" Name="+this.children[i].name+" id="+this.children[i].id+" zIndex="+this.children[i].zIndex);
            }
            console.log ("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
        },
        topWidgetUnderMouse: function(mouseEvent){
            var topChild = null;
            for(var i = 0; i < this.children.length; i++){
                if(this.children[i].isUnderMouse(mouseEvent))
                    if(this.children[i].zIndex > topChild.zIndex)
                        topChild = this.children[i];
            }
            if(topChild.isContainer)
                return topChild.topWidgetUnderMouse();
        },
        isUnderMouse: function(e){
            var x = e.pageX;
            var y = e.pageY;
            // code here
        }
    });
}); //end of  module  