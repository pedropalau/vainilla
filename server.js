const browserSync = require('browser-sync');
const express = require('express');
const serveIndex = require('serve-index');

const app = express();
const port = 3000;

// conditionally add routes and behaviour based on environment
// https://github.com/voorhoede/front-end-tooling-recipes/tree/master/express-with-nodemon-browsersync
const isProduction = 'production' === process.env.NODE_ENV;

app.set('etag', isProduction);
app.use((req, res, next) => {
  res.removeHeader('X-Powered-By');
  next();
});

app.use('/', express.static(__dirname));

// enable directory listing on '/content' folder
app.use('/content', express.static('content'), serveIndex('content'));

app.listen(port, () => {
  console.log('listening on port: 3000');
  if(!isProduction) {
    // https://ponyfoo.com/articles/a-browsersync-primer#inside-a-node-application
    browserSync({
      files: ['src/**/*.{html,js,css}'],
      online: false,
      open: false,
      port: port + 1,
      proxy: 'localhost:' + port,
      ui: false
    });
  }
});
