var WMtimer = 0,
CLtimer = 0,
SACtimer = 0;

function formatTime(totalSec) {
    var minutes = parseInt( totalSec / 60 ) % 60;
    var seconds = totalSec % 60;

    var result =  (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
    return result;
};

function countdown() {
    //The date object returns milliseconds since 1970; so this is chopping off the milliseconds and basing the date off the seconds only https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
    var offset_seconds = parseInt((new Date()).getTime()/1000,10);
    console.log('offset_seconds:'+offset_seconds);


    WMtimer -= 1;
    $('#WMtimeleft').text(WMtimer);
    $('#WMtimer').attr('value',WMtimer);
    CLtimer -=1;
    $('#CLtimeleft').text(CLtimer);
    $('#CLtimer').attr('value',CLtimer);
    SACtimer -=1;
    $('#SACtimer').attr('value',SACtimer);
    //      $('#SACtimeleft').html(SACtimer);
    $('#SACtimeleft').text(SACtimer);
    $('#SACtimeMinSec').text(formatTime(SACtimer));
    $('#WMtimeMinSec').text(formatTime(WMtimer));
    $('#CLtimeMinSec').text(formatTime(CLtimer));

    console.log('WM:'+WMtimer+' CL:'+CLtimer+' SAC:'+SACtimer);
};

var socket = io.connect('http://localhost:3000');//for express


socket.on('SACtimer', function(data) {
    console.log('SACtimer called');      console.log(data);
    
    var elem =  $('#SACtimer')
    if (typeof elem !== 'undefined') {
	$('#SACtimer').attr('max',data);
    }

    $('#SACtimer').attr('max',data);
    //      $('#SACduration').html(data);
    $('#SACduration').text(data);
    //    SACtimer = data;
});
socket.on('SAC', function(data) {
    console.log(data.data);
    $('#SAC').html(data.data);
});

//set time on initial load
socket.on('SACremainingtime', function(data) {$('#SACtimer').attr('value',data); SACtimer = data; console.log('SACtime:'+data); });
socket.on('WMremainingtime', function(data) {$('#WMtimer').attr('value',data); WMtimer = data; console.log('WMtime:'+data); });
socket.on('CLremainingtime', function(data) {$('#CLtimer').attr('value',data); CLtimer = data; console.log('CLtime:'+data); });

socket.on('CLtimer', function(data) {
    console.log('CLtimer called');
    var elem =  $('#CLtimer')
    if (typeof elem !== 'undefined') {
	$('#CLtimer').attr('max',data);
	$('#CLduration').text(data);
    }
    //      CLtimer = data;
});

socket.on('CL', function(data) {
    console.log(data.data);
    $('#CL').html(data.data);
});

socket.on('WMtimer', function(data) {
    console.log('WMtimer called');
    var elem =  $('#WMtimer')
    if (typeof elem !== 'undefined') {
	$('#WMtimer').attr('max',data);
	$('#WMduration').text(data);
    }

    //      WMtimer = data; //this will overwrite what was sent in the emit('WMtime', call!
});

socket.on('WM', function(data) {
    console.log(data.data);
    $('#WM').html(data.data);
});
socket.on('counter', function(data) {
    $('#counter').html(data);
});
socket.on('welcome', function(data) {
    $('#welcome').html(data.message);
    console.log(data.message);

    //using setInterval seems a bit expensive. Is there another way to do this? simply post the ending time based on the time the deal was inited and its duration?
    //start this when we receive the welcome message
    setInterval(countdown,1000); //http://stackoverflow.com/questions/457826/pass-parameters-in-setinterval-function
});
socket.on('error', function() { console.error(arguments) });
socket.on('message', function() { console.log(arguments) });
