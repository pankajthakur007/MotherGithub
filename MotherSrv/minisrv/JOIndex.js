var server = require("./JOServer");
var router = require("./JORouter");
var requestHandlers = require("./JORequestHandlers");
var handle = {};
handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/dir"] = requestHandlers.dir;
handle["/upload"] = requestHandlers.upload;
handle["/grid"] = requestHandlers.grid;
handle["/dtTable"] = requestHandlers.dtTable;

server.start(router.route,handle);