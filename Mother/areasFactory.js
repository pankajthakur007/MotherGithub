define([
    "dojo/_base/declare",
    "dijit/registry",
    "/pdojo/MotherGitHub/Mother/textbox.js",
    "/pdojo/MotherGitHub/Mother/numberbox.js",
    "/pdojo/MotherGitHub/Mother/container.js",
], function(declare,registry,textbox,numberbox,container) {
    return declare(null,{
        lastAreaOrder:0,
        lastTextboxOrder:0,
        lastNumberboxOrder:0,
        lastContainerOrder:-1, //0 is reserved for the base container
        baseContainer:null,
        constructor: function(baseContainer) {
            var canvasContainer = registry.byId("_1"); //to destroy a dijit widget by id
            if(canvasContainer){
                canvasContainer.destroyRecursive();
                // throw new Error("You attemped to recreate the canvas, but canvas already exists !!!");
            }
            var left = 0;
            var top = 0;
            var width = window.screen.width;
            var height = window.screen.height;
            //REVIEW for clarity - this is an evolution from calling  this.createContainer()          
            this.lastAreaOrder++;
            this.lastContainerOrder++;
            var baseContainerProperties = {name: "canvas", left: left, top: top, width: width, height: height};
            declare.safeMixin(baseContainerProperties,
                {domId: "container_id" + this.lastContainerOrder,id: "_"+this.lastAreaOrder,areaOrder: this.lastAreaOrder,containerParent: this.baseContainer});
            this.baseContainer = new container(baseContainerProperties);
        },
        createTextboxIn: function(container,widgetProperties) {//always refer to a container if no container is present default container is selected
            if(container){
                //coordinates left,top are stored with absolute values, but in this method are received in container coordinates
                var absoluteLeft = container.left;
                var absoluteTop = container.top;
                if (widgetProperties.left)
                    absoluteLeft += widgetProperties.left;
                if (widgetProperties.top)
                    absoluteTop += widgetProperties.top;
                declare.safeMixin(widgetProperties,{left: absoluteLeft,top: absoluteTop});   
                var txt=this.createTextbox(widgetProperties);//textbox created in canvas
                container.addExistingChild([txt]);//now textbox is inside in container
            } else {
                alert("areasFactory.createTextboxIn(): You attemped to create a textbox inside an unexisting container !");
                throw new Error("areasFactory.createTextboxIn(): You attemped to create a textbox inside an unexisting container !");
            }
            return txt;
        },
        createNumberboxIn: function(container,widgetProperties) {//always refer to a container if no container is present default container is selected
            if(container){
                //coordinates left,top are stored with absolute values, but in this method are received in container coordinates
                var absoluteLeft = container.left;
                var absoluteTop = container.top;
                if (widgetProperties.left)
                    absoluteLeft += widgetProperties.left;
                if (widgetProperties.top)
                    absoluteTop += widgetProperties.top;
                declare.safeMixin(widgetProperties,{left: absoluteLeft,top: absoluteTop});   
                var num=this.createNumberbox(widgetProperties);//numberbox created in canvas
                container.addExistingChild([num]);//now numberbox is inside in container
            } else {
                alert("areasFactory.createTextboxIn(): You attemped to create a textbox inside an unexisting container !");
                throw new Error("areasFactory.createNumberboxIn(): You attemped to create a textbox inside an unexisting container !");
            }
            return num;
        },
        createTextbox: function(widgetProperties) {//always refer to a container if no container is present default container is selected
            this.lastAreaOrder++;
            this.lastTextboxOrder++;
            //id will be used inside dojo objects, domId will be used to access dom outside dojo...
            var widgetName = widgetProperties.name;
            if (!widgetName)
                widgetName = "textbox" + this.lastTextboxOrder;
            declare.safeMixin(widgetProperties,
                {name: widgetName,domId: "widget_id" + this.lastAreaOrder,id: "_"+this.lastAreaOrder,areaOrder: this.lastAreaOrder,containerParent: this.baseContainer});
            var txt = new textbox(widgetProperties);
            this.baseContainer.addExistingChild([txt]);
            return txt;
        },
        createNumberbox: function(widgetProperties) {
            this.lastAreaOrder++;
            this.lastNumberboxOrder++;
            var widgetName = widgetProperties.name;
            if (!widgetName)
                widgetName = "numberbox" + this.lastNumberboxOrder;
            declare.safeMixin(widgetProperties,
                {name: widgetName,domId: "widget_id" + this.lastAreaOrder,id: "_"+this.lastAreaOrder, areaOrder: this.lastAreaOrder,containerParent: this.baseContainer });
            // return new numberbox(widgetProperties);
            var num = new numberbox(widgetProperties);
            this.baseContainer.addExistingChild([num]);
            return num;
        },
        createContainer: function(containerProperties) {
            this.lastAreaOrder++;
            this.lastContainerOrder++;
            var containerName = containerProperties.name;
            if (!containerName)
                containerName = "container" + this.lastContainerOrder;
            declare.safeMixin(containerProperties,
                {name: containerName,domId: "container_id" + this.lastContainerOrder,id: "_"+this.lastAreaOrder,areaOrder: this.lastAreaOrder,containerParent: this.baseContainer});
            // return new container(containerProperties);
            var c = new container(containerProperties);
            this.baseContainer.addExistingChild([c]);
            return c;
        }
    });
}); //end of  module  