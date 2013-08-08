function execRemoteInvoke(target, method, args){
    var xhr = new XMLHttpRequest();
    xhr.open("post", "http://192.168.1.71:8102/invoke", false);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({"client" : window.location.hash, "target" : target, "method" : method, "args" : args}));
    return xhr.responseText;
}

function getHandler(target){

    return {
        "get" : function(obj, prop){
            return function(){

                var args = [].slice.call(arguments, 0);

                if (target === "gSTB" && prop === "Debug"){
                    console.log(args.join(', '));
                    return;
                }

                return execRemoteInvoke(target, prop, args);
            };
        },
        "getPropertyDescriptor" : function(){
            return undefined;
        }
    }
}

var gSTB = Proxy.create(getHandler("gSTB"));
var stbDownloadManager = Proxy.create(getHandler("stbDownloadManager"));
var timeShift = Proxy.create(getHandler("timeShift"));

var socket = new WebSocket("ws://192.168.1.71:8101/upstream");

socket.onopen = function(){
    console.log("Socket has been opened!");
};

socket.onclose = function(){
    console.log("Socket has been closed!");
};

socket.onmessage = function(msg){
    console.log(msg);
};

