var http = require('http'),
fs = require('fs'),
mongoClient = require('mongodb').MongoClient,
// NEVER use a Sync function except at start-up!
index = fs.readFileSync(__dirname+'/index.html');

// Send index.html to all requests
var app = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);
});

// Socket.io server listens to our app
var io = require('socket.io').listen(app);

//we only need this for startup bc otherwise we trigger on an insert/change to the db and the last record will be the one most recently entered
function getLastRecordForSite(site) {
    mongoClient.connect('mongodb://127.0.0.1:27017/bc',function(err,db){
        if (err) {throw err;}
        var collection  = db.collection('deal');
//        collection.find({site:site}).sort({_id:-1}).limit(1).toArray(function(err,data) {
//        collection.find({site:site}).limit(1).toArray(function(err,data) {
        collection.find({site:site}).sort({_id:-1}).limit(1).toArray(function(err,data) {
	    if (err) {throw err;}
	    var timeLeft = 0;
	    console.log('getLastRecordForSite '+site);
                switch(site){
                case "WM":
                case "CL":
//		    console.log(data.productTitle);
//		    console.log(data[0]);
		 //   console.log(data[0]);
//I'm having a problem where the computed timeLeft ends up > than the duration, some i'm using the min as a workaround
//		    timeLeft = data[0].duration - (parseInt((new Date()).getTime()/1000,10) - data[0].utc_load_time )
		    timeLeft =Math.min( data[0].duration - (parseInt((new Date()).getTime()/1000,10) - data[0].utc_load_time ),data[0].duration)
		    console.log(data[0].duration+' '+parseInt((new Date()).getTime()/1000,10)+' '+ data[0].utc_load_time +' diff:'+(parseInt((new Date()).getTime()/1000,10) - data[0].utc_load_time ));
//		    console.log('timeLeft:'+timeLeft);
		    io.sockets.emit(data[0].site+'remainingtime',timeLeft); //the {WM,SAC,CL}timer value is overwritten by the io.sockets.emit call just outside of this switch statement :(
		    break;
		case "SAC":
//		    console.log(data.name);
//		    console.log(data[0]);
		    timeLeft = data[0].timeRemaining;
//		    console.log('timeRemaining:'+data[0].timeRemaining);
		    io.sockets.emit(data[0].site+'remainingtime',timeLeft); //the {WM,SAC,CL}timer value is overwritten by the io.sockets.emit call just outside of this switch statement :(

		    break;
		}
		var siteTimer = data[0].site+'timer';
		io.sockets.emit(siteTimer,data[0].duration);
	});//end collection.find
//	db.close();
    });//end mongoClient.connect

};

//we trigger on an insert/change to the db and the last record will be the one most recently entered
function getLastRecord() {
    mongoClient.connect('mongodb://127.0.0.1:27017/bc',function(err,db){
        if (err) {throw err;}
        var collection = db.collection('deal');
//        collection.find({}).sort({_id:-1}).limit(1).toArray(function(err,data) { //for arch linux
        collection.find({}).sort({_id:1}).limit(1).toArray(function(err,data) { //for linux mint
	    if (err) { console.log(err); }
	    console.log('getLastRecord');
	    if (typeof data !== 'undefined' && data !== null && data.length > 0) {
		var siteTimer = data[0].site+'timer';
       		var timeLeft = 0;
         switch(data[0].site){
                case "WM":
                case "CL":
		    console.log('getlastRecord====:'+data[0].productTitle);
		    getRecordListForProduct(data[0].productTitle);
		    //console.log('utc_time_offset:'+data[0].utc_load_time);
//emit the correct remaining time
//I'm having a problem where the computed timeLeft ends up > than the duration, some i'm using the min as a workaround
//		    timeLeft = data[0].duration - (parseInt((new Date()).getTime()/1000,10) - data[0].utc_load_time )
		    timeLeft =Math.min( data[0].duration - (parseInt((new Date()).getTime()/1000,10) - data[0].utc_load_time ),data[0].duration)
//you can also look at the 'emitted' data that is output to the consoel as well. 
		    console.log(data[0].duration+' '+parseInt((new Date()).getTime()/1000,10)+' '+ data[0].utc_load_time +' diff:'+(parseInt((new Date()).getTime()/1000,10) - data[0].utc_load_time ));
//		    console.log('timeLeft:'+timeLeft);
		    io.sockets.emit(data[0].site+'remainingtime',timeLeft); //the {WM,SAC,CL}timer value is overwritten by the io.sockets.emit call just outside of this switch statement :(
		    break;
		case "SAC":
		    console.log('getLastRecord----:'+data[0].name);
		    getRecordListForProduct(data[0].name);
		    timeLeft = data[0].timeRemaining;
		    //console.log('timeRemaining:'+data[0].timeRemaining);
		    io.sockets.emit(data[0].site+'remainingtime',timeLeft); //the {WM,SAC,CL}timer value is overwritten by the io.sockets.emit call just outside of this switch statement :(
		    break; 
		default:
		    console.log('getLastRecord----:'+JSON.stringify(data));
		    break;
		}
		console.log(siteTimer+' '+data[0].duration);
		//TODO: this needs to be fixed such that a new connection (which proly won't start right when a product is update) gets an accurate timer duration.
		io.sockets.emit(siteTimer,data[0].duration);
//		io.sockets.emit(data[0].site+'remainingtime',timeLeft); 
	    } else {
		console.log('fuck');
	    }
	});//end collection.find
//	db.close();
    });//end mongoClient.connect
    console.log('end getLastRecord');
};

function getRecordListForProduct(product) {
    var searchProduct = product;
    mongoClient.connect('mongodb://127.0.0.1:27017/bc',function(err,db){
        if (err) {throw err;}
        //deals will be the name of the table/colleciton                                         
        var collection  = db.collection('deal');
	collection.find({ $or: [ {name: searchProduct },{productTitle: searchProduct }]}).toArray(function(err,data) {
	    console.log('getRecordListForProduct:');
	    if (typeof data !== 'undefined' && data.length>0){
		for (var counter = 0, size=data.length; counter<size;counter++){
                    switch(data[counter].site){
                    case "WM":
                    case "CL":
			console.log(data[counter].productTitle+' '+data[counter].price);
			break;
		    case "SAC":
			console.log(data[counter].name+' '+data[counter].price);
			break;
		    default:
			console.log('site not found');
		    }
		}
	    }

	});//end collection.find
//	db.close();
    });//end mongoClient.connect

};

function getRecordsFromDB(site,callback) {
    var output;
    mongoClient.connect('mongodb://127.0.0.1:27017/bc',function(err,db){
        if (err) {throw err;}
        //deals will be the name of the table/colleciton
        var collection  = db.collection('deal');
        output="<ul>";
        var image;
	//console.log(site);
//        collection.find({site:site}).sort({_id:-1}).limit(5).toArray(function(err,data) { //arch
        collection.find({site:site}).sort({_id:1}).limit(5).toArray(function(err,data) { // mint

	
//        collection.find({}).sort({_id:-1}).limit(5).toArray(function(err,data) {
//console.log(data);
            if (err) { throw err;}
            else {
                switch(site){
                case "WM":
                case "CL":
                    for (var counter = 0, size=data.length; counter<size;counter++){
                        //for these, the quantity is in the 'variant' data; I think it might also be elsewhere in the html of the page in the javascript
                        if (data[counter].variants) {
                            for (var key in data[counter].variants) { /*console.log(key);*/ break;}
                            if (data[counter].variants[key].images && data[counter].variants[key].images.mediumImage !== null){
                                image =  data[counter].variants[key].images.mediumImage;
                            } else if (data[counter].variants[key].images && data[counter].variants[key].images.smallImage !== null){
                                image = data[counter].variants[key].images.smallImage;
                            } else { image = ":(";}
                        }
			//                      console.log(data[counter].productTitle+' $'+data[counter].price);
                        //If it is the first element (i.e. the current deal) make the image a link to the site
                        var link="";
                        if (counter===0 ) {
                            switch (site){
                            case "WM":
                                link="http://www.whiskeymilitia.com";
                                break;

                            case "CL":
                                link="http://www.chainlove.com";
                                break;
                            }
                            output+='<li> <a href="'+link+'"><img  src="'+image+'"></a>'+data[counter].productTitle+' $'+data[counter].price+'</li>';
                        } else {
                            output+='<li> <img src="'+image+'">'+data[counter].productTitle+' $'+data[counter].price+'</li>';
                        }
                    }
                    break;
                case "SAC":
                    for (var counter = 0, size=data.length; counter<size;counter++){
			//                      console.log(data[counter].brand.name+data[counter].name+' $'+data[counter].price);
                        if (data[counter].defaultImage && data[counter].defaultImage.url.medium) {
                            image = data[counter].defaultImage.url.medium;
                        } else if (data[counter].defaultImage && data[counter].defaultImage.url.tiny) {
                            image = data[counter].defaultImage.url.url.tiny;
                        }
                        //If it is the first element (i.e. the current deal) make the image a link to the site
                        if (counter===0) {
                            output+='<li> <a href="http://www.steepandcheap.com/current-steal"> <img height="100" width="100" src="'+image+'"></a>'+data[counter].brand.name+' '+data[counter].name+' $'+data[counter].price+' duration:'+data[counter].duration+' quantity:'+data[counter].qtyInitial+'</li>';
                        } else {
                            output+='<li> <img height="100" width="100" src="'+image+'">'+data[counter].brand.name+' '+data[counter].name+' $'+data[counter].price+' duration:'+data[counter].duration+' quantity:'+data[counter].qtyInitial+'</li>';
                        }
                    }
                    break;
                }
            }
//            db.close();//node will hang without this
            output+="</ul>";
//	    console.log("site:"+site);
//	    console.log("ouput:"+output);
            console.log("finish up getRecordsFromDB");

            callback( site,output );
        });
    });
};

// function emitData(site,data) {
// io.sockets.emit(site,{
// };

function emitData(site,data) {
    console.log('emitData called for '+site);
//    console.log('data:' + data);
    io.sockets.emit(site ,{data:data});
    var time = new Date().getTime();
};

var counter=0; 
// Emit welcome message on connection
io.sockets.on('connection', function(socket) {
    console.log('connection');

//get initial data set so they aren't staring at an empty screen.
    getRecordsFromDB('SAC',emitData);
    getLastRecordForSite('SAC');

    getRecordsFromDB('CL',emitData);
    getLastRecordForSite('CL');
    
    getRecordsFromDB('WM',emitData);
    getLastRecordForSite('WM');
    //   getLastRecord();

    //watch out 'heartbeat' file for notifications of any changes
    fs.watch('/tmp/BackCountryHeartbeat.txt',function(curr,prev) { 
	var options={encoding:'utf8'};
	console.log('file change detected');
	fs.readFile('/tmp/BackCountryHeartbeat.txt',options,function(err,data) { 
	    //extract site from the watch file
	    var site = data.split(',')[0];
	    console.log(site);
	    //for some reason this is being called twice.
	    if (typeof site !== 'undefined' && site !== "") {
		getRecordsFromDB(site,emitData);
		getLastRecord();
	    }
	})
    });
    
    socket.emit('welcome', { message: 'Welcome! You are user #'+counter });
    counter++;
    console.log('connect, num users:'+counter);
    
    socket.on('i am client', console.log);
    socket.on('disconnect',function() {
	if (counter)  { 
	    --counter;
	    console.log('disconnect, num users:'+counter);
	}
    });
});

app.listen(8090);
