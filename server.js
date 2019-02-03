const express = require('express');
const serveIndex = require('serve-index');

const app = express();

app.use('/', express.static(__dirname));

// enable directory listing on '/content' folder
app.use('/content', express.static('content'), serveIndex('content'));

app.listen('3000', () => {
  console.log('listening on port: 3000');
});
