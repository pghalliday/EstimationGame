var http = require('http');

var server = http.createServer(function(request, response) {
  response.end('<!-- EstimationGame Home Page -->');
});

server.listen(8080, function() {
  console.log('Started');
});