// The in-memory Store. Encapsulates logic to access wine data.
window.csvStore = {
    csvRows:{}, //a JSON of JSONs  {1:{},2:{}...n:{}}; //NOTE:each row  should have a boolean sync field to work in offline mode
    numberOfRows:0,
    attributesArr: null,
    setAttributesArr: function(attributesArr){
        //format [{label:"xx",name:fieldName,description:xDescription,type:xtype,typeUI:xTypeUI,enumerable:xEnumerable,key:xKey},{col2}...{}]
        this.attributesArr = attributesArr;
    },
    getAttributesArr: function(){
        return this.attributesArr;
    },
    getAttributesArrNoId: function(){//return [{attr1:x11,attr2:x21.,..attrN:xN1},{attr1:x12,attr2:x22.,..attrN:xN2}...{}]
        var retArr = [];
        _.each(this.attributesArr, function(element,index){
            if (element.name!="id")
                retArr.push(element);
        });
        return retArr;
    },
    setEntityName: function(entityName){//sets entity name and csvStore.attributesArr
        this.entityName = entityName;
        // defines attributesArr to set in setAttributesArr(attributesArr)  -->format [{label:"xx",name:fieldName,description:xDescription,type:xtype,enumerable:xEnumerable},{col2}...{}]
        var oEntity = FL.dd.getEntityBySingular(entityName);
        this.setAttributesArr(oEntity.attributes);
    },
    getEntityName: function(){
        return this.entityName;
    },
    setEnumerableForAttribute: function(attribute, arrOfValues){
        _.each(this.attributesArr, function(element){
            if (element.name== attribute)
                element.enumerable = arrOfValues;
        });
    },
    getEnumerableFromAttribute: function(attribute){//returns the content of enumerable or null if attribute does not exist
        var xRet = null;
        var elementWithEnum = _.find(this.attributesArr, function(element){ return element.name == attribute;});
        if(elementWithEnum)
            xRet = elementWithEnum.enumerable;
        return xRet;
    },    
    extractEmailArray: function(){//returns an array of emails with format [{"email":"e1@live.com"},{"email":"email2@gmail.com"}..]
        //only retrieves valid email formats
        var attrArr = this.getAttributesArr();
        // console.log("-xxxx-->"+JSON.stringify(attrArr));
        var attrEl = _.find(attrArr,function(element){return element.typeUI == "email";});//find first email among fields
        if(typeof attrEl =="undefined")
            attrEl = _.find(attrArr,function(element){return element.typeUI == "emailbox";});//find first email among fields old format
        if(typeof attrEl =="undefined"){
            alert("memoryCsv.js extractEmailArray NO FIELD WITH typUI = email !!!!");
        }
        // console.log("-zzz-->"+JSON.stringify(attrEl));
        var nameOfFirstEmailField = attrEl.name;
        // console.log("-name-->"+nameOfFirstEmailField);
        var arrOfEmails = _.map(this.csvRows,function(value,key){
            return {"email":value[nameOfFirstEmailField]}; 
        });
        var arrOfEmails = _.filter(arrOfEmails,function(element){
            return utils.is_email(element.email); //filters only valid emails
        });

        // console.log("-www-->"+JSON.stringify(arrOfEmails));
        return arrOfEmails
    },
    getAttributesOfType: function(typeToSelect){//from this.attributesArr return a subset with type= typeToSelect
        var retArr = _.filter(this.attributesArr, function(element){
            //attributesArr format [{label:"xx",name:fieldName,description:xDescription,type:xtype,typeUI:xTypeUI,enumerable:xEnumerable,key:xKey},{col2}...{}]
            return element["type"] == typeToSelect;
        });
        if(_.isUndefined(retArr))
            retArr = null;
        return retArr;
    },
    extractFromCsvStore: function(){
        //Ex: from csvStore.csvRows = {"1":{"id":1,"shipped":true,"product":"Prod 1",_id:"55d3.."},"2":{"id":2,"shipped":false,"product":"Prod 2",_id:"55d3.."}}
        var retArr=_.map(csvStore.csvRows, function(value,key){return value;});
        return retArr;
    },
    extractFromCsvStoreWith_Id: function(){
        //Ex: from csvStore.csvRows = {"1":{"id":1,"shipped":true,"product":"Prod 1",_id:"55d3.."},"2":{"id":2,"shipped":false,"product":"Prod 2",_id:"55d3.."}}
        var entityName = this.getEntityName();
        var retArr=_.map(csvStore.csvRows, function(value,key){
            var _id = value["_id"];
            var recordEl = FL.API.convertOneRecordTo_arrToSend(entityName,value);////Converts format: {"name":cli1,"city":"Lx","country":"Pt"} to {"d":{"51":"cli1","52":"Lx","53":"Pt"}} 
            recordEl["_id"] = _id;
            return recordEl;//returns {_id:x1,d:{"51":"cliente 1","52":"Lisboa","53":"Portugal"}
        },this);
        return retArr;
    },
    transformStoreTo: function(newAttributesArr,changedNamesArr,changedTypeArr){//transform the store content according to newAttributesArr and changedNamesArr and  changedTypeArr
        //newAttributesArr - new format of attributes in csvStore.
        //       must have keys attr1..7 = name,description,label,type,typeUI,enumerable and key
        //       [{attr1:x11,attr2:x21.,..attrN:xN1},{attr1:x12,attr2:x22.,..attrN:xN2}...{}]
        // changedNamesArr - is an array with one element per attriobute name change [[],[]...[]]. Each element is [<oldName>,<newName>]
        // changedTypeArr - is an array with one element per type change [[],[]...[]]. Each element is [<oldName>,<oldType>,<newType>]
        // 
        //  this method returns true if the change implies losing information, false otherwise     
        var loseInfo = false;
        var attributesArrNoId = this.getAttributesArrNoId();//we retrieve all except name="id"
        //   ex: {name:"address",description:"address to send invoices",label:"Address",type:"string",typeUI:"textbox",enumerable:null,key:false});                     
        _.each(this.csvRows, function(rowObj,key){//scans each row (an Object) {1:{},2:{}...n:{}} - rowObj is the object
            _.each(changedTypeArr, function(element){
                var name = element[0];
                var oldType = element[1];
                var newType = element[2];
                if(oldType == "string" && newType == "number"){
                    var numberVal = rowObj[name];
                    this.csvRows[key][name]= FL.common.localeStringToNumber(numberVal,null);
                    loseInfo = true;
                }else if(newType == "date"){//covers string->date, number->date
                    if(typeof rowObj[name] != "date" ){//if is a string containing a date must be converted
                        this.csvRows[key][name] = new Date( rowObj[name] );//old content in string is converted to date
                        loseInfo = true;
                    }
                }else if(oldType == "date" && newType == "number"){
                    this.csvRows[key][name] = 0;
                    loseInfo = true;
                }else if(oldType == "number" && newType == "string"){
                     this.csvRows[key][name] = rowObj[name].toString();
                }
            },this);
            _.each(changedNamesArr, function(element){
                this.csvRows[key][element[1]] = this.csvRows[key][element[0]];//creates a new name key with the content of the old key
                delete this.csvRows[key][element[0]];
            },this);
            var z=32;
        },this);//this is necessary to refer to window.csvStore instead of window
        this.setAttributesArr(newAttributesArr);
        return loseInfo;
    },
    store: function( arrToStore ) {//arrToStore is an array of objects [{},{},....{}] where id field is mandatory inside {}
        // this.csvRows = _.object(arrOfIds,arrToStore); //becomes ->{1:arrToStore[1],2:arrToSAtore[2]....} 
        this.csvRows = {};
        var arrOfDateAttributes = this.getAttributesOfType("date");
        _.each(arrToStore,function(element,index){//scans each row (an Object)
            var id = (index+1)+"";//the json key is a string
            element.id = index+1;//to rename the id sequence - id is anumber
            this.csvRows[id] = element;
            
            //code to convert dateInStringFormat (if any) to date in Javascript date format
            // if(arrOfDateAttributes){
                _.each(arrOfDateAttributes, function(elementCol){
                    if(typeof element[elementCol.name] != "date" ){
                        // element[elementCol.name] = new Date(Date.parse(element[elementCol.name]));//old content in string is converted to date
                        element[elementCol.name] = new Date( element[elementCol.name] );//old content in string is converted to date
                    }
                });
            // }
            //-------------------

        },this);//this is necessary to refer to window.csvStore instead of window
        this.numberOfRows = arrToStore.length;
    },
    changeNameInRows: function(oldName, newName){//updates the key oldname (old attribute name) to newname of all csvRows
        _.each(this.csvRows, function(rowObj,key){//scans each row (an Object) {1:{},2:{}...n:{}} - rowObj is the object
            this.csvRows[newName] = rowObj[oldName];
            delete this.csvRows[oldName];
             var z=32;
        },this);//this is necessary to refer to window.csvStore 
    },
    getRowsInArrFormat: function(){//retrieves csvRows object ({1:{},2:{}...n:{}}) in a array format [{},{}...{}]
        var arr =_.map(this.csvRows,function(value,key){//scans each key inside csvRows object
            return value;
        });
        return arr;   
    },
    addOneEmptyRow:function(){//adds one line to csvRrows with empty fields of this.entityName and _id="-1"
        var nextId = this.getNextId();
        //we will extract form dictionary the fields with empty values
        // var oEntity = FL.dd.getEntityBySingular(this.entityName);
        // columnsArr --> Format: [{label:"xx",name:fieldName,type:xtype,enumerable:xEnumerable},{col2}...{}]
        var columnsArr = this.getAttributesArr();//returns an array of fields with empty content
        // var newRow = utils.defaultNewGridRow(columnsArr, nextId);
        var newRow = FL.dd.emptyRowForArrOfTypes(columnsArr);
        newRow.id = nextId;


        this.csvRows[nextId] = newRow;//becomes ->{93:arrToStore[1],2:arrToSAtore[2]....} 
        this.csvRows[nextId]["_id"] = "-1";//this means a new line that must be inserted in the server
        var z = 32;
    },
    getNextId: function(){//returns a number with the id of the last element + 1 
        var arrOfKeys = _.keys(this.csvRows);
        // arrOfKeys[3] = "101";// to test
        var last = _.max(arrOfKeys,function(element){ return  parseInt(element,10); });
        if(arrOfKeys.length === 0 ){
            last = 0;
        }else{
            if( isNaN( this.csvRows[last].id ) )
                last = 0;
        }
        return parseInt(last,10)+1;
    },
    getNumberOfLines: function(){//returns a number with the id of the last element + 1 
        var arrOfKeys = _.keys(this.csvRows);
        var numberOfLines = arrOfKeys.length;
        return numberOfLines;
    },
    populate: function () {
        this.csvRows[1] = {
            id: 1,
            name: "CHATEAU DE SAINT COSME",
            year: "2009",
            grapes: "Grenache / Syrah",
            country: "France",
            region: "Southern Rhone",
            description: "The aromas of fruit and spice give one a hint of the light drinkability of this lovely wine, which makes an excellent complement to fish dishes.",
            picture: "saint_cosme.jpg"
        };
        this.csvRows[2] = {
            id: 2,
            name: "WATERBROOK",
            year: "2009",
            grapes: "Merlot",
            country: "USA",
            region: "Washington",
            description: "Legend has it the gods didn't share their ambrosia with mere mortals.  This merlot may be the closest we've ever come to a taste of heaven.",
            picture: "waterbrook.jpg"
        };

        this.numberOfRows = 2;
    },

    find: function (model) {
        alert("memoryCsv find !!!!");
        return this.csvRows[model.id];//NOT USED
    },

    findAll: function () {
        return _.values(this.csvRows);//it is used !!!
    },

    create: function (model) {       
        this.numberOfRows++;
        // model.set('id', this.numberOfRows);
        console.log("memoryCsv.js create new line --->"+JSON.stringify(model));
        model["_id"] = "-1";
        this.csvRows[this.numberOfRows] = model;//it is used !!!
        return model;
    },

    update: function (model) {
        var def = $.Deferred();
        // alert("memoryCsv.js Update was called !!!");
    // this.csvRows[model.id] = model;//it is used !!!
        //alert("memoryCsv.js update modelUpdate !!!! --->"+ model.get("id") + " _id="+ model.get("_id") + " nome="+model.get("nome"));
        console.log("memoryCsv.js update modelUpdate !!!! --->"+JSON.stringify(model));
        var rowToSave = model.attributes;
        rowToSave = _.omit(rowToSave, "_id");//we exclude the _id key
        var promise = null;
    //if(model.attributes._id == "-1"){//this is an update over a new line =>insert in db
        var thiz = this;
        if(this.csvRows[model.id]._id == "-1"){//this is an update over a new line =>insert in db
            // promise=FL.API.addRecordsToTable(this.entityName,[model.attributes]);
            promise=FL.API.addRecordsToTable(this.entityName,[rowToSave]);
            promise.done(function(data){
                console.log(">>>>>memoryCsv update addRecordsToTable  SUCCESS <<<<<");
                console.log("memoryCsv.js update addRecordsToTable !!!! --->"+JSON.stringify(data));
                //data format:
                // [  {"d": {"51":"Nome do cliente","52":"Cascais","53":"Portugal",
                //        "54":["cliente@sapo.pt","clienteportugese@gmail.com"]},
                //     "r":[{"r":"59","s":0,"e":"50","l":[{"_id":"789fgd89","u":"n"}]}],
                //     "v":0,
                //     "_id":"53e1bf93f9b224b302c2a572"}
                // ]
            // return model;
                model.attributes._id =  data[0]._id;
                thiz.csvRows[model.id] = model.attributes;//copy of server database _id to memory copy
                return def.resolve(model);
            });
            promise.fail(function(err){console.log(">>>>>memoryCsv update addRecordsToTable FAILURE <<<<<"+err);return def.reject(err);});
        }else if(model.attributes._id){//this is an update over an existing line =>update in db
            FL.API.serverCallBlocked = true;//HACK to prevent server call (menu calling a grid) before this promise is resolved
            promise = FL.API.updateRecordToTable(this.entityName,model.attributes);
            promise.done(function(data){
                console.log(">>>>>memoryCsv update updateRecordToTable  SUCCESS <<<<< -->"+JSON.stringify(data));
                thiz.csvRows[model.id] = model.attributes;
                FL.API.serverCallBlocked = false;
                return def.resolve(model);
            });
            promise.fail(function(err){console.log(">>>>>memoryCsv update updateRecordToTable FAILURE <<<<<"+err); FL.API.serverCallBlocked = false; return def.reject(err);});
        }else{
            console.log(">>>>>memoryCsv update updateRecordToTable  NOP Nothing was done !!!! <<<<< -->model.attributes._id="+model.attributes._id);
            return def.reject("memoryCsv update error - missing attribute _id in model");
        }
        // return model;
        return def.promise();
    },

    destroy: function (model) {
        console.log("memoryCsv.js - delete row "+JSON.stringify(model.attributes));
        // var promise=FL.API.removeRecordFromTable(this.entityName,model.attributes);
        // promise.done(function(){
        //     console.log(">>>>>memoryCsv destroy removeRecordFromTable SUCCESS <<<<<");
        //     return model;
        // });
        // promise.fail(function(err){console.log(">>>>>memoryCsv destroy removeRecordFromTable FAILURE <<<<<"+err);return model;});
        delete this.csvRows[model.id];//it is used !!!
        return model;
    },
    sync: function (method, model, options) {//function that Backbone calls every time it attempts to read or save a model to the server.

        var resp;
        // console.log("Backbone.sync ---------------->"+method+" id="+model.id);
        console.log("----------------- debug before------------------------------------------");

        console.log("csvStore.csvRows[1]:\n"+JSON.stringify(csvStore.csvRows[1]));
        console.log("csvStore.csvRows[2]:\n"+JSON.stringify(csvStore.csvRows[2]));
        console.log("csvStore.csvRows[3]:\n"+JSON.stringify(csvStore.csvRows[3]));
        var last = csvStore.getNextId()-1;
        console.log("LastId= "+last);
        console.log("csvStore.csvRows[last]:\n"+JSON.stringify(csvStore.csvRows[last]));
        console.log("----------------- debug fim ------------------------------------------");
        // alert("Backbone.sync ---------------->"+method+" ---> id="+model.id);

        switch (method) {
            case "read":
                resp = model.id ? csvStore.find(model) : csvStore.findAll();
                break;
            case "create":
                resp = csvStore.create(model);
                break;
            case "update":
                // resp = csvStore.update(model);
                csvStore.update(model).then(function(resp){
                        console.log("memoryCsv.js sync update --->"+JSON.stringify(resp.attributes));
                    },function(err){
                        console.log("memoryCsv.js sync update ERROR --->");
                    }
                );
                break;
            case "delete":
                resp = csvStore.destroy(model);
                break;
        }

        if(options) {
            if (resp) {
                options.success(resp);
            } else {
                options.error("Record not found");
            }
        }
        // console.log("csvStore.csvRows:\n"+JSON.stringify(csvStore.csvRows));
        console.log("----------------- debug after------------------------------------------");

        console.log("csvStore.csvRows[1]:\n"+JSON.stringify(csvStore.csvRows[1]));
        console.log("csvStore.csvRows[2]:\n"+JSON.stringify(csvStore.csvRows[2]));
        console.log("csvStore.csvRows[3]:\n"+JSON.stringify(csvStore.csvRows[3]));
        last = csvStore.getNextId()-1;
        console.log("LastId= "+last);
        console.log("csvStore.csvRows[last]:\n"+JSON.stringify(csvStore.csvRows[last]));

        console.log("----------------- debug fim ------------------------------------------");

        // alert("Leaving csv.Store !!!");

    },
    // currentGridCandidate:'',
    currentGridCandidate:{fileName:'',entityName:null},
    arrayOfGrids: [],//array with pairs [[entitySingularName,{a JSON of JSONs with csvRows}],[xxx,{}],.....]
    insertInArrayOfGrids: function(singularEntityName) {//inserts current JSON of JSONs in an pair array with first element = singular
        this.arrayOfGrids.push([singularEntityName,csvStore.csvRows]);
    },
    setGrid: function(singular){
        var arrPair = _.find(this.arrayOfGrids, function(element) {return element[0] == singular;});
        this.csvRows = arrPair[1];
    }
};

// csvStore.populate();

// Overriding Backbone's sync method. Replace the default RESTful services-based implementation
// with a simple in-memory approach.
//Backbone.sync = store.sync;
// Backbone.sync = function (method, model, options) {