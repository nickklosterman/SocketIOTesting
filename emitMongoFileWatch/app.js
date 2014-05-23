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

function getRecordsFromDB(site,callback) {
    var output;
    mongoClient.connect('mongodb://127.0.0.1:27017/bc',function(err,db){
        if (err) {throw err;}
        //deals will be the name of the table/colleciton
        var collection  = db.collection('deal');
        output="<ul>";
        var image;
	//console.log(site);
        collection.find({site:site}).sort({_id:-1}).limit(14).toArray(function(err,data) {
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
                            output+='<li> <a href="'+link+'"><img  src="'+image+'"> </a>'+data[counter].productTitle+' $'+data[counter].price+'</li>';
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
                            output+='<li> <a href="http://www.steepandcheap.com/current-steal"> <img height="100" width="100" src="'+image+'"> </a>'+data[counter].brand.name+' '+data[counter].name+' $'+data[counter].price+' duration:'+data[counter].duration+' quantity:'+data[counter].qtyInitial+'</li>';
                        } else {
                            output+='<li> <img height="100" width="100" src="'+image+'">'+data[counter].brand.name+' '+data[counter].name+' $'+data[counter].price+' duration:'+data[counter].duration+' quantity:'+data[counter].qtyInitial+'</li>';
                        }
                    }
                    break;
                }
            }
            db.close();//node will hang without this
            output+="</ul>";
	    console.log("site:"+site);
	    console.log("ouput:"+output);
            console.log("finish up getRecordsFromDB");

            callback( site,output );
        });
    });
};

function emitData(site,data) {
    console.log('emitData called for '+site);
    io.sockets.emit(site ,{data:data});
};

var counter=0; 
// Emit welcome message on connection
io.sockets.on('connection', function(socket) {
    console.log('connection');
    fs.watch('/tmp/BackCountryHeartbeat.txt',function(curr,prev) { 
	var options={encoding:'utf8'};
	console.log('file change detected');
	fs.readFile('/tmp/BackCountryHeartbeat.txt',options,function(err,data) { 
	    
	    var site = data.split(',')[0];
	    console.log(site);
	    //for some reason this is being called twice.
	    if (typeof site !== 'undefined' && site !== "") {
		getRecordsFromDB(site,emitData);
	    }
	})
    });
    
    socket.emit('welcome', { message: 'Welcome!' });
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
