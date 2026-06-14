const fs = require('fs');
try {
  console.log('Reading bark.m4a...');
  const bark = fs.readFileSync('data/bark.m4a');
  console.log('Converting bark, size:', bark.length);
  fs.writeFileSync('data/bark_base64.txt', bark.toString('base64'));

  console.log('Reading shush.m4a...');
  const shush = fs.readFileSync('data/shush.m4a');
  console.log('Converting shush, size:', shush.length);
  fs.writeFileSync('data/shush_base64.txt', shush.toString('base64'));

  console.log('Success Node conversion');
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}
