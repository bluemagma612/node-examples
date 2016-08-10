var cluster = require("cluster");
var http = require("http");
var numWorkers = 200;

if (cluster.isMaster) {
    // fork workers
    for(var i = 0; i < numWorkers; i++ ) {
        console.log('master: about to fork a worker');
        cluster.fork();
    }
    
    cluster.on('fork', function(worker) {
        console.log('master: fork event (worker ' + worker.id + ')');
    });
    
    cluster.on('online', function(worker) {
        console.log('master: online event (worker ' + worker.id + ')');
    });
    
    cluster.on('listening', function(worker,address) {
        console.log('master: listening event (worker ' + worker.id + ', pid ' + worker.process.pid + ', ' + address.address + ':' + address.port + ')');
    });
    
    cluster.on('exit', function(worker, code, signal) {
        console.log('master: exit event (worker ' + worker.id + ')');
    });
} else {
    console.log('worker: worker #' + cluster.worker.id + ' ready!');
    
    var count = 0;
    
    //workers can share any TCP connection
    // in this case its an http server
    http.createServer(function(req,res){
        res.writeHead(200);
        //console.dir(req);
        count++
        console.log('Worker #' + cluster.worker.id + ' is incrementing count to ' + count);
        res.end('Hello world from worker #' + cluster.worker.id + ' (pid '+ cluster.worker.process.pid + ") with count = " + count + "\n");
        //ensure operating system is doing its job of dividing up requests among the workers
        if (count === 3) {
            cluster.worker.destroy();
        }
    }).listen(8080, "127.0.0.1");
}