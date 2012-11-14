var http = require('http');

var PORT = process.argv[2] || process.env.PORT || 8080;

var server = http.createServer(function(request, response) {
  response.end('<!-- EstimationGame Home Page -->');
});

server.listen(PORT, function() {
  console.log('Started');
});