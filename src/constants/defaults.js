import Markdown from '../parsers/Markdown.js';
import formatPostDate from '../utils/formatPostDate.js';

export default {
  types: [],
  plugins: [],
  extension: '.md',
  dateRegularExpression: /\d{4}-\d{2}(?:-\d{2})?/,
  formatDate: formatPostDate,
  contentParser: Markdown,
  templatesPath: 'html',
  templatesExtension: 'tpl.html',
  notFoundTemplate: '404',
  navigationHash: '#',
}
