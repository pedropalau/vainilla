import Blog from './src/Blog.js';

import settings from './settings.js';

const blog = new Blog({
  ...settings,
  root: document.getElementById('blog'),
});
