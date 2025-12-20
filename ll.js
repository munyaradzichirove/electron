const { spawn } = require('child_process');
const tcpdump = spawn('/usr/bin/tcpdump', [
  '-i', 'wlo1',
  '-n',
  '-l',  // line buffered
  '-U'   // unbuffered, forces Node to see packets immediately
]);

tcpdump.stdout.on('data', (data) => {
  process.stdout.write(data.toString());
});

tcpdump.stderr.on('data', (data) => {
  console.error('stderr:', data.toString());
});

tcpdump.on('error', (err) => {
  console.error('tcpdump failed to start:', err);
});

tcpdump.on('close', (code) => {
  console.log(`tcpdump exited with code ${code}`);
});

process.on('SIGINT', () => {
  console.log('\nStopping tcpdump...');
  tcpdump.kill('SIGINT');
  process.exit();
});
