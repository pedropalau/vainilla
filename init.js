import Vainilla from './src/Vainilla.js';

import settings from './settings.js';

const blog = new Vainilla({
  ...settings,
  root: document.getElementById('blog'),
});

blog.bootstrap();
