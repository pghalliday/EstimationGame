console.log('press any key');

process.stdin.setRawMode(true);    
process.stdin.resume();
function end(chunk) {
  process.stdin.pause();
}
process.stdin.on('data', end);
