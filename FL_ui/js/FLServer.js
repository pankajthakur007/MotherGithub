// jQuery(document).ready(function($){
	/**
	* data dictionary UI methods 
	*/
	// FL = FL || {}; //gives undefined if FL is undefined 
	// FL = {};
	// // a="A";
	// b="B";
	// var a = (typeof a === 'undefined') ? b : a;//if a is defined returns "A" otherwise returns the content of b
	// alert("zzz="+a);//sets "B"
	FL = (typeof FL === 'undefined') ? {} : FL;
	FL["server"] = (function(){//name space FL.server
		// entities={__Last:0,__LastRelation:0};//this is an object of objects (not an array of objects)
		//the key of the internal objects is the singular entity name
			//   {__Last:<number>,__LastRelation:<number>} is a special object with:
			//			__Last - The total the number of entities. This is used to generate entity compressed names
			//			__LastRelation - The total the number of relations. This is used to generate idRelation compressed names
			//   each internal object(entity) has: 
			//      key:{singular:xSingular,csingular:xCSingular,plural:xPlural,description:xDescription,lastId:0,L2C:{},C2L:{},attributes:[]};	
			//		ex:{"Client":{singular:"Client",
			//					csingular:"01",
			//					plural:"clients",
			//					description:"Individual or Company to whom we may send invoices",
			//					sync:false,
			//					lastId:0,
			//					L2C:{},
			//					C2L:{},
			//					attributes:[]	
			//					relations:[]	
			//		}};
			//
			//  singular - is the human (logical) entitity name
			//	csingular - is the compressed entity name (does not change on renames)
			//  plural - plural expression corresponding to singular
			//  description - description of singular (answer to: "what is a <singular> ?")
			//	sync - false if no synchronization was done with the server - true if synchronization was done
			//				- if sync = false (default) csingular and all attributes fieldCN are temporary 
			//				- when sync = true - csingular and all attributes fieldCN are correct
			//  lastId - number of attributes of entity <singular>
			//
			//each attribute (i) is in dDictionary.entities[<sEentity>].arributes[i]
			//     with the format 
			//		{name:"address",description:"address to send invoices",label:"Address",type:"string",enumerable:null,key:false});
			//
			//			name -  is the human (logical) attribute name
			//			description - description of attribute (answer to: "what the <name > of a <entity.singular> ?")
			//			label - defaul value that will appear in UI labeling the attribute
			//			type - one of:  "number","string","enumerable",email","boolean","object","array","null","undefined"
			//				NOTE: if type is "enumerable", the key enumerable must have an array of enumerables
			//			enumerable - an array of enumerables or null (if key type != "enumerable"
			//			key - boolean. True means the attribute is the  key field of the entity . (only one allowed)
			//          fieldCN - field vcompressed name - (NICO)
			//
			// each relation (i) is in dDictionary.entities[<sEntity>].relations[i]
			//     with the format 
			//     oRelation-->	{idRelation:3,cIdRelation:"03",rightEntity:"Invoice",description:"has",cardinality:"0_1",semantic:"Client has many Invoices",delChildren:false});
		 	//    		idRelation - key for database table "relation" int(11) autoincrement
		 	//    		cIdRelation - compressed name corresponding to idRelation - independent identifier  
			//      Note: semantic property is redundant with all other relation properties and with the entity key.
			//      Sych Server 
			//		      //cIdRelation ->rCN returned has _id
			//			  rightEntity ->entityCN ->U
			//			              side - must be saved in the customer dictionary
			//			  IF relation not reflexive
			//			  		description (change to verb) - V - if not reflexive
			//            IF relation reflexive
			//					two entries are necessary with the same right entity -side must be saved one is 0 the other is 1
			//			  cardinality :W ->0,1,N
			//			  delChildren ->option TBD->"02":[{delChildren:true,....}]
			//
		var internalTest = function(x) {//for entity=xSingular, returns the index of attribute=xAttribute
			alert("internalTest() -->"+x);
		};
		var disconnectServer = function() {
			FL.server.fa.disconnect(function(e,d){
				alert ('bye');
			});
		};
		var connectServer = function(userName,password,connectServerCB) {
			// var fl = new flMain();
			if(!FL.server.fa)
				FL.server.fa = new FL.server.fl.app();
			var fa = FL.server.fa;
			// var fa = new FL.server.fl.app();
			FL.server.fl.setTraceClient(2);
			FL.server.fl.serverName('flServer');
			FL.server.fl.login({"username": userName, "password": password}, function (err, data){
				if (err){
					alert('flLoging: err=' + JSON.stringify(err));
					return connectServerCB(false);
					// return console.log ('flLoging: err=' + JSON.stringify(err));
				}
				var myApp =data.applications[0];
					alert ('connecting to '+myApp.name);
					fa.connect(myApp, function(err2, data2){
					if (err2){
						alert('fla.connect: err=' + JSON.stringify(err2));
						return connectServerCB(false);
						// return console.log ('fla.connect: err=' + JSON.stringify(err2));
					}
					// var fEnt = new FL.server.fl.entity();
					// fEnt.getAll({query:{}}, function (err, data){
					// 	if(err){
					// 		alert('error in entity.getAll: ' + err);
					// 		return ('error in entity.getAll: ' + err);
					// 	}
					// 	alert(JSON.stringify(data));
					// });
					return connectServerCB(true);
				});
			});
		};
		return{
			fl: new flMain(),//FL.server.fl
			fa: null,
			byPass:true,
			connect: function(userName,password,connectServerCB){
				// alert("connectServer byPass="+byPass);
				if(!this.byPass)
					connectServer(userName,password,connectServerCB);
			},
			disconnect: function(){
				// alert("disconnectServer byPass="+byPass);
				if(!this.byPass)
					disconnectServer();
			},
			createServerEntity_Fields: function(entityName,createServerEntity_FieldsCB){
				// cb();
				var oEntity = FL.dd.getEntityBySingular(entityName);
				var eCN = null;
				async.waterfall([
					function(waterfallCB1){//waterfallCB1 to be managed by assync
						var fEntity = new FL.server.fl.entity();
						fEntity.add({"3": oEntity.singular, "4": oEntity.description, 'E': oEntity.plural}, function (err, data){
							if(err){
								alert("createEntity Error: "+JSON.stringify(err));
								return waterfallCB1(err);//async should exit the waterfall
							}
							eCN=data[0]['_id'];
							return waterfallCB1(null,eCN);//null=>it ok, eCN isd passed to  next function
						});	
					},
					function(eCN,waterfallCB2){
						var index = 0;
						var ffield = new FL.server.fl.field();//var ffield = new fl.field();
						var fCN = null;
						async.whilst(//whilst needs 3 functions. Func1=>exit criteria, Func2=>repeat function, Funct3=>when complete function 
							//NICO recommends:
							//	all callbacks to be used by async must be after a return
							function(){
								return index<oEntity.attributes.length;
							},
							function(loadAttributeCB){//loadAttributeCB is to be used by async	
								var enumerableArr = oEntity.attributes[index].enumerable;
								if(!enumerableArr)
									enumerableArr = [];
								ffield.add(	{"1": eCN, "3": oEntity.attributes[index].name, "4":oEntity.attributes[index].description, 'K': oEntity.attributes[index].label, 'M': oEntity.attributes[index].type, 'O':'simple','N':enumerableArr}, function (err, data){
									if(err){
										alert("FLdd2.js addAttribute Error:"+JSON.stringify(err));
										index=oEntity.attributes.length+1;//to exit the loop
										return loadAttributeCB(err);//inform async that it should exit the loop  
									}								
									fCN = data[0]['_id'];
									var oldCFieldName = oEntity.L2C[oEntity.attributes[index].name]; 
									delete oEntity.C2L[oldCFieldName];
									oEntity.L2C[oEntity.attributes[index].name] = fCN;//Logical to Compressed
									oEntity.C2L[fCN] = oEntity.attributes[index].name;//Compressed to Logical
									index++;
									return loadAttributeCB(null);//inform async that it can repeat the loop
								});
							},
							function(err){//The loop is over - this parameter comes from previous callback
								waterfallCB2(err);//exit waterfall function
								//when done
							}
						);// asyncwhilst
					}
				],function(err){ //This function gets called after the two tasks have called their  "task callbacks"
					console.log("If no error ->entity and fields are in server s over !!! ErroR:"+err);
					if(!err){
						console.log("synchronization is done in client dictionary");
						oEntity.csingular = eCN;
						oEntity.sync = true;
					}else{
						alert("ERROR createServerEntity_Fields unfinished!!!");
					}
					if(typeof createServerEntity_FieldsCB == "function")
						createServerEntity_FieldsCB(err);
				});
			},
			insertCsvStoreDataTo: function(entityName,insertCB){
				var oEntity =  FL.dd.getEntityBySingular(entityName);
				var eCN = oEntity.csingular;
				if(oEntity.sync){
					var fd=new this.fl.data();
					fd.insert(eCN, FL.dd.getSavingRowsForCsvStore(entityName),function(err, data){
						if (err){
							alert('insertCsvStoreDataTo: err=' + JSON.stringify(err));
							return insertCB(false);
						}
						var myApp =data.applications[0];
					});
				}else{
					alert("FL.server.insertCsvStoreDataTo() Error: UI Dictionary for entity="+entityName+" is not synchronized !!!");
				}
			},
			NicoAddAttribute: function(xSingular,xAttribute,xDescription,xLabel,xType,arrEnumerable) {//adds AttributeName,Description, label Type amd enumerable to oEntity of Data Dictionary
				// if Type != "enumerable" => ArrEnumerable will be forced to null.
				// if xAttribute already exists it is updated with xDescription, xType (xKey will not be changed)
				// if xAttribute does not exist it is created with xDescription, xType and xKey forced to false
				//		
				// NOTE on xKey - the only attribute that has xKey=true is always created or removed when the entity is created or removed
				//    To update the name and description of the key attribute of a just created attribute:
				//		dDictionary.createEntity("Client","clients","Individual or Company to whom we may send invoices");//singular, plural, description
				//		dDictionary.renameAttribute("Client","id","name");//renaming the key attribute
				//		dDictionary.addAttribute("Client","name","client's id","Name",string",null);//xEntity,xAttribute,xDescription,xType,xKey
				//		
				//		If we are updating a key attribute we force the type to "number" independently of the xType parameter
				//	
				//oEntity={singular:"Client",plural:"clients",description:"Company to send invoices",lastId:0,L2C:{},C2L:{},attributes:[]};
				//checks if attribute already exists. If it exists updates, otherwise create it !!!
				//console.clear();
				var oEntity = this.entities[xSingular];
				var ffield = null;
				var sComp = null;
				if(oEntity){
					var xIndex = attributeIndex(xSingular,xAttribute);
					if(xIndex<0){//if it does not exists creates it

						// var nId = oEntity.lastId++;
						// var sComp = getCompressed(nId++);

						ffield = new FL.server.fl.field();//var ffield = new fl.field();
	
						ffield.add(	{"1": oEntity.csingular , "3": xAttribute, "4":xDescription, 'K': xLabel, 'M': xType, 'O':'simple','N':arrEnumerable}, function (err, data){
							if(err){
								alert("FLdd2.js addAttribute Error:"+JSON.stringify(err));
								return;
							}
							sComp = data[0]['_id'];
							if(xType !="enumerable")
								arrEnumerable = null;
							oEntity.attributes.push({name:xAttribute,description:xDescription,label:xLabel,type:xType,enumerable:arrEnumerable,key:false});
							oEntity.L2C[xAttribute] = sComp;//Logical to Compressed
							oEntity.C2L[sComp] = xAttribute;//Compressed to Logical
							// oEntity.lastId = nId;

						});
					}else{//updates the existing attribute - if xKey is true (it will continue to be true)
						alert("XXXXXXXXX to be done");
						oEntity.attributes[xIndex].description = xDescription;
						oEntity.attributes[xIndex].label = xLabel;
						if(oEntity.attributes[xIndex].key)//if we are updating a key attribute we force the type to "string"
							xType="number";
						oEntity.attributes[xIndex].type = xType;
						if(xType !="enumerable")
							arrEnumerable = null;
						oEntity.attributes[xIndex].enumerable = arrEnumerable;

						//oEntity.attributes[xIndex].key=xKey;
					}
					//dDictionary.save(xSingular,oEntity);
				}else{
					alert("FL.dd.addAttribute Error: you tried to add attribute "+xAttribute+" to a non existing entity "+xSingular);
					//Err.alert("dDictionary.addAttribute",(new Error)," you tried to add attribute "+xAttribute+" to a non existing entity "+xSingular);
				}
				// console.log("dDictionary.addAttribute ->" + attributeSemantics(xAttribute,xDescription,oEntity,"En"));
			},
			testFunc: function(x) {
				alert("FL.server.test() -->"+x);
			}
		};
	})();
// });