var fs = require('fs');

function writeTime() { 
    var time = new Date().toJSON();
    fs.writeFile(__dirname+'/output.txt', time, function(err) { 
	if(err) { 
	    console.log(err);
	} else {
	    console.log("The file was saved!");
	}
	
    });
};
setInterval(writeTime,10000);
