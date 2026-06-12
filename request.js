const http = require('http');

console.log("Sending request to http://127.0.0.1:3000/login ...");
const req = http.get('http://127.0.0.1:3000/login', (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk.substring(0, 100)}...`);
  });
  res.on('end', () => {
    console.log('No more data in response.');
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
  process.exit(1);
});

req.setTimeout(30000, () => {
  console.log('Request timed out after 30 seconds');
  req.destroy();
  process.exit(1);
});
