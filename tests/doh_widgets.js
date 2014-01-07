//define(["doh/runner"], function(doh) {
define([
    "doh",
    "dojo/dom",
    "dojo/dom-construct",
    "dijit/registry",
    "simple/Mother/textbox",
    "simple/Mother/numberbox",
    "simple/Mother/container",
    "simple/Mother/areasFactory"
    ], function(doh,dom,domConstruct,registry,textbox,numberbox,container,areasFactory){
    doh.register("textbox 101",{
        "Should instantiate successfully":{
            setUp:function(){
                this.txt = new textbox({left:500, top:150, width:340, height:300, value:"Michael"});
            },
            runTest:function(){
            }
        },
        "Should return value,left,top,width and weight":{
            setUp:function(){
                this.txt = new textbox({left:500, top:150, width:340, height:300, value:"Michael"});
            },
            runTest:function(){
                doh.assertEqual("Michael", this.txt.value);
                doh.assertEqual("500", this.txt.left);
                doh.assertEqual("150", this.txt.top);
                doh.assertEqual("340", this.txt.width);
                doh.assertEqual("300", this.txt.height);
            }
        },
        "Should return default values left,top,width,height":{
            setUp:function(){
                this.txt = new textbox({value:"Michael"});
            },
            runTest:function(){
                doh.assertEqual("500", this.txt.left);
                doh.assertEqual("100", this.txt.top);
                doh.assertEqual("100", this.txt.width);
                doh.assertEqual("30", this.txt.height);
            }
        },
        "Should set border thickness to 5 and color to blue and resize":{
            setUp:function(){
                this.txt = new textbox({left:500, top:100, width:300, height:300, value:"Pukas"});
                this.txt.setBorder({borderThickness:5, borderColor:"blue"});
                this.txt.resize({width: 200, height: 100});
            },
            runTest:function(){
                doh.assertEqual("5", this.txt.borderThickness);
                doh.assertEqual("blue", this.txt.borderColor);
                doh.assertEqual("200", this.txt.width);
                doh.assertEqual("100", this.txt.height);
            }
        },
        "Should move free textbox to new position":{
            setUp:function(){
                this.txt = new textbox({left:500, top:100, width:300, height:300, value:"Pukas"});
                this.txt.moveTo({left:1000, top:200});
            },
            runTest:function(){
                doh.assertEqual("1000", this.txt.left);
                doh.assertEqual("200", this.txt.top);
            }
        }
    });
    doh.register("numberbox 101",{
        "Should instantiate successfully":{
            setUp:function(){
                this.n = new numberbox({left:500, top:150, width:340, height:300, value:129.2});
            },
            runTest:function(){
            }
        },
        "Should return value,left,top,width and weight":{
            setUp:function(){
                this.n = new numberbox({left:501, top:150, width:340, height:300, value:129.2});
                doh.assertEqual("501", this.n.left);
                doh.assertEqual("150", this.n.top);
                doh.assertEqual("340", this.n.width);
                doh.assertEqual("300", this.n.height);
            },
            runTest:function(){
                console.log("===========================>value="+this.n.value);
                doh.assertEqual(129.2, this.n.value);
            }
        },
        "Should return default values left,top,width,height":{
            setUp:function(){
                this.n = new numberbox({value:129.2});
            },
            runTest:function(){
                doh.assertEqual("500", this.n.left);
                doh.assertEqual("100", this.n.top);
                doh.assertEqual("100", this.n.width);
                doh.assertEqual("30", this.n.height);
            }
        },
        "Should set border thickness to 5 and color to blue and resize":{
            setUp:function(){
                this.n = new numberbox({left:500, top:100, width:300, height:300, value:129.2});
                this.n.setBorder({borderThickness:5, borderColor:"blue"});
                this.n.resize({width: 200, height: 100});
            },
            runTest:function(){
                doh.assertEqual("5", this.n.borderThickness);
                doh.assertEqual("blue", this.n.borderColor);
                doh.assertEqual("200", this.n.width);
                doh.assertEqual("100", this.n.height);
            }
        }
    });
    doh.register("General widgets",{
        "Should return counters for area,textboxes,numberboxes":{
            setUp:function(){
                //http://kevinandre.com/dev/jsunittest-amd-doh-1/
                this.af = new areasFactory();//this generates a baseContainer
                this.num1 = this.af.createNumberbox({left:500, top:50, width:340, height:100, value:129.2, borderColor:"purple"});
                this.num2 = this.af.createNumberbox({left:1000, top:50, width:340, height:50, value:123});
                this.txt1 = this.af.createTextbox({left:100, top:50, width:340, height:300, value:"junkas"});
            },
            runTest:function(){
                doh.assertEqual("4", this.af.lastAreaOrder);
                doh.assertEqual("1", this.af.lastTextboxOrder);
                doh.assertEqual("2", this.af.lastNumberboxOrder);
            }
        },
    });
    doh.register("containers 101", {
        //http://kevinandre.com/dev/jsunittest-amd-doh-1/ ---//define(["doh","simple/Mother/textbox"], function(doh,textbox) {
        "Should instantiate succesfully":{
            setUp:function(){
                this.af = new areasFactory();
                this.c1 = this.af.createContainer({left: 450, top: 100, width: 240, height: 150,borderColor: "red"});
                this.c1.setBorder({borderThickness: 10, borderColor: "green"});
            },
            runTest:function(){
                doh.assertEqual("green", this.c1.borderColor,"The container does not remember borderColor: 'green'");
                doh.assertEqual("10", this.c1.borderThickness);
                doh.assertEqual("450", this.c1.left);
                doh.assertEqual("100", this.c1.top);
                doh.assertEqual("240", this.c1.width);
                doh.assertEqual("150", this.c1.height);
            }
        },
        "free container: set borderThickness to 10 and borderColor to green":{
            setUp:function(){
                this.c1 = container({left: 680, top: 140, width: 500, height: 250, borderThickness: 7, borderColor: "red"});
                this.c1.setBorder({borderThickness: 10, borderColor: "green"});
            },
            runTest:function(){
                doh.assertEqual("10", this.c1.borderThickness,"The container does nor remember borderThickness: 10");
                doh.assertEqual("green", this.c1.borderColor, "The container does nor remember borderColor: 'green'");
            }
        },
        "change # of children and containerParent.name on addExistingChild() ": {
            setUp:function(){
                this.af = new areasFactory();
                this.c1 = this.af.createContainer({left: 450, top: 100, width: 240, height: 150,borderColor: "red"});
                this.num1 = this.af.createNumberbox({left:500, top:50, width:340, height:100, value:129.2, borderColor:"purple"});
                this.txt1 = this.af.createTextbox({left:500, top:50, width:340, height:100, value:129.2, borderColor:"purple"});
                this.c1.addExistingChild([this.num1,this.txt1]);
            },
            runTest: function() {
                doh.assertEqual("2", this.c1.children.length,"container c1 should have 2 childs");
                doh.assertEqual("container1", this.num1.containerParent.name,"default name for c1 should be 'container1'");//"container1" is the default name for the first container
            }
        },
        "zIndex1) change when we create a widget over a widget in canvas": {
            setUp:function(){
                this.af = new areasFactory();
                this.num1 = this.af.createNumberbox({left: 567+20, top: 78+20, width:100, height:30, value:129.2, borderColor:"purple"});//zIndex=0
                this.num2 = this.af.createNumberbox({left: 567+30, top: 78+30, width:100, height:30, value:129.2, borderColor:"purple"});//zIndex=1
                this.c1 = this.af.createContainer({left: 567+10, top: 78+10, width: 500, height: 500,borderColor: "red"});//zIndex=0
                this.freeC2 = new container({left: 567+300, top: 78+10, width: 500, height: 500,borderColor: "red"});//zIndex=0
                // this.c1.addExistingChild([this.num1]);//num1.zIndex=1
            },
            runTest: function() {
                doh.assertEqual("0", this.num1.zIndex,"num1 is not over the canvas (zIndex 0)");//num1(zIndex=0) is over canvas
                doh.assertEqual("1", this.num2.zIndex,"num2 is not over num1 (zIndex 1)");//num2.zIndex=1 is over num 1)
                doh.assertEqual("2", this.c1.zIndex,"container has not num2.zIndex+1 !!!!");//num2.zIndex+1=2)
                doh.assertEqual("-1", this.freeC2.zIndex,"free container has not zIndex=-1");//num2.zIndex+1=2)
            } 
        },
       "zIndex2) change when we create a container over a numberbox and add that numberBox to the container": {
            setUp:function(){
                this.af = new areasFactory();
                this.num1 = this.af.createNumberbox({left: 567+20, top: 78+20, width:100, height:30, value:129.2, borderColor:"purple"});//zIndex=0
                this.c1 = this.af.createContainer({left: 567+10, top: 78+10, width: 500, height: 500,borderColor: "red"});//zIndex=1
                // this.c1.addExistingChild([this.num1]);//num1.zIndex=2
            },
            runTest: function() {
                doh.assertEqual("1", this.c1.zIndex);
                // doh.assertEqual("2", this.num1.zIndex);
            } 
        },        
        "zIndex3) build container c1 w/n1 to include c2 w/num2. C1 involves c2": {
            setUp:function(){
                console.clear();
                this.af = new areasFactory();
                this.c1 = this.af.createContainer({left: 567+10, top: 78+10, width: 500, height: 500,borderColor: "red"});//zIndex=0
                this.num1 = this.af.createNumberbox({left: 567+20, top: 78+20, width:100, height:30, value:129.2, borderColor:"purple"});//zIndex=1
                this.c1.addExistingChild([this.num1]);//num1.zIndex=1
                //-----------
                this.c2 = this.af.createContainer({left: 567+30, top: 78+30, width: 400, height: 400,borderColor: "blue"});//zIndex=2
                this.num2 = this.af.createNumberbox({left: 567+40, top: 78+40, width: 100, height: 30, value:129.2, borderColor:"purple"});//zIndex=3
                this.c2.addExistingChild([this.num2]);//num2.zIndex=3
                this.c1.addExistingChild([this.c2]);//c1.zIndex=0
                this.af.baseContainer.childDump();
            },
            runTest: function() {
                doh.assertEqual("1", this.num1.zIndex);//initially it was on canvas but over c1. Then it was included in c1. zIndex does not change
                doh.assertEqual("0", this.c1.zIndex);
                //---------
                doh.assertEqual("2", this.c2.zIndex);//container placed on canvas but above num1
                doh.assertEqual("3", this.num2.zIndex);
            } 
        },
       "move within container: change zIndex moving a widget over another widget, a widget over a container and container over another container": {
            setUp:function(){
                this.af = new areasFactory();
                this.num1 = this.af.createNumberbox({left: 567+20, top: 78+20, width:100, height:30, value:129.2, borderColor:"purple"});//zIndex=0
                this.num2 = this.af.createNumberbox({left: 567+30, top: 78+30, width: 100, height: 30, value:229.2, borderColor:"purple"});//zIndex=1
                this.num3 = this.af.createNumberbox({left: 567+30, top: 78+100, width: 100, height: 30, value:329.2, borderColor:"green"});//zIndex=0
                this.num3.moveTo({top:  78+40});
                this.c1 = this.af.createContainer({left: 567+30, top: 78+30, width: 400, height: 400,borderColor: "blue"});//zIndex=2
                this.num4 = this.af.createNumberbox({left: 567+30, top: 78+450, width: 100, height: 30, value:429.2, borderColor:"green"});//zIndex=0
                this.num4.moveTo({top: 78+100});
                this.c2 = this.af.createContainer({left: 567+300, top: 78+450, width: 100, height: 200,borderColor: "blue"});//zIndex=0
                this.c2.moveTo({left: 567+30,top: 78+100});
  
            },
            runTest: function() {
                doh.assertEqual("0", this.num1.zIndex);
                doh.assertEqual("1", this.num2.zIndex);
                doh.assertEqual("2", this.num3.zIndex,"num3 was moved over num1 (zIndex=1) and did not get zIndex=2");
                doh.assertEqual("3", this.c1.zIndex);
                // doh.assertEqual("0", this.num4.zIndex);//on canvas before move
                doh.assertEqual("4", this.num4.zIndex,"num4 was moved over container c1 (zIndex=3) and did not get zIndex=4");
                doh.assertEqual("5", this.c2.zIndex);//on canvas before move
            } 
        },        
        "move container (c1) containing: 2 widgets (num1,num2) and a container (c2) with 2 widgets (num3,num4)": {
            setUp:function(){
                this.af = new areasFactory();
                this.c1 = this.af.createContainer({left: 567+10, top: 78+10, width: 400, height: 400,borderColor: "blue"});//zIndex=0
                this.num1 = this.af.createNumberbox({left: 567+20, top: 78+20, width:100, height:30, value:129.2, borderColor:"purple"});//zIndex=1
                this.num2 = this.af.createNumberbox({left: 567+30, top: 78+30, width: 100, height: 30, value:229.2, borderColor:"purple"});//zIndex=2
                this.c1.addExistingChild([this.num1,this.num2]); //c1.zIndex=0,num1.zIndex=1,num2.zIndex=2
                this.c2 = this.af.createContainer({left: 567+200, top: 78+20, width: 150, height: 100,borderColor: "blue"});//zIndex=0
                this.num3 = this.af.createNumberbox({left: 567+210, top: 78+30, width:100, height:30, value:329.2, borderColor:"purple"});//zIndex=1
                this.num4 = this.af.createNumberbox({left: 567+210, top: 78+40, width:100, height:30, value:429.2, borderColor:"purple"});//zIndex=1
                this.c2.addExistingChild([this.num3,this.num4]); //c2.zIndex=1,num3.zIndex=2,num3.zIndex=3
                this.c1.addExistingChild([this.c2]); //c2.zIndex=1,num3.zIndex=2,num3.zIndex=3
                this.c1.moveTo({left: 567+20,top: 78+20});
            },
            runTest: function() {
                doh.assertEqual("0", this.c1.zIndex);
                doh.assertEqual("1", this.num1.zIndex);
                doh.assertEqual("2", this.num2.zIndex);
                doh.assertEqual("1", this.c2.zIndex);
                //------------------------------- now checks that widgets of container c2 were correctly moved
                doh.assertEqual("787", this.num3.left);
                doh.assertEqual("118", this.num3.top);
                doh.assertEqual("787", this.num4.left);
                doh.assertEqual("128", this.num4.top);
            } 
        },        
     });
    doh.register("createIn family", {
        //http://kevinandre.com/dev/jsunittest-amd-doh-1/ ---//define(["doh","simple/Mother/textbox"], function(doh,textbox) {
        "createContainerIn an empty container":{
            setUp:function(){
                this.af = new areasFactory();
                this.c1 = this.af.createContainer({left: 567, top: 78, width: 240, height: 150,borderColor: "red"});
                this.c11 = this.af.createContainerIn(this.c1,{name: "Inside form c1",left:20,top: 20,width: 100,height: 100,borderColor: "blue"});
            },
            runTest:function(){
                doh.assertEqual("blue", this.c11.borderColor,"The inside container does not remember borderColor: 'blue'");
                doh.assertEqual("587", this.c11.left,"The inside container coordinates are not 587,98 !");
                doh.assertEqual("98", this.c11.top,"The inside container coordinates are not 587,98 !");
            }
        },
        "createContainerIn a container with 2 widgets created with create___In and place num111 inside it":{
            setUp:function(){
                this.af = new areasFactory();
                this.c1 = this.af.createContainer({left: 567, top: 78, width: 240, height: 150,borderColor: "red"});
                this.txt1 = this.af.createTextboxIn(this.c1,{left: 10, top: 10,width: 100,height: 20,title:"txt1"}); 
                this.num1 = this.af.createNumberboxIn(this.c1,{left: 10, top: 20,width: 50,height: 20,title:"num1"}); 
                this.c11 = this.af.createContainerIn(this.c1,{name: "Inside form c1",left:20,top: 20,width: 100,height: 100,borderColor: "blue"});
                this.num111 = this.af.createNumberboxIn(this.c11,{left: 10, top: 10,width: 50,height: 20,title:"num111"}); 
            },
            runTest:function(){
                doh.assertEqual("587", this.c11.left,"The inside container coordinates are not 587,98 !");
                doh.assertEqual("98", this.c11.top,"The inside container coordinates are not 587,98 !");
                doh.assertEqual("0", this.c1.zIndex,"The inside container zIndex is not 0 !");
                doh.assertEqual("1", this.txt1.zIndex,"The inside container zIndex is not 1 !");
                doh.assertEqual("2", this.num1.zIndex,"The inside container zIndex is not 2 !");
                doh.assertEqual("3", this.c11.zIndex,"The inside container zIndex is not 3 !");
                doh.assertEqual("4", this.num111.zIndex,"The numberBox inside c11 zIndex is not 4 !");
                doh.assertEqual("597", this.num111.left,"The inside container coordinates are not 597,108 !");
                doh.assertEqual("108", this.num111.top,"The inside container coordinates are not 597,108 !");
            }
        },
      });
    doh.register("DOH test 4 release Model ", [
        //http://kevinandre.com/dev/jsunittest-amd-doh-1/ ---//define(["doh","simple/Mother/textbox"], function(doh,textbox) {
        function assertTrueTest() {
            doh.assertTrue(true);
            doh.assertFalse(false);
            doh.assertEqual("Kevin", String('Kevin'));
            doh.assertNotEqual("Kevin", String('Kevin A'));
        }
    ]);
});