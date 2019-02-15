import Component from './Component.js';
import Node from './Node.js';

import dom from './utils/dom.js';
import request from './utils/request.js';
import noop from './utils/noop.js';

class Collection extends Component {
  constructor(props) {
    super(props);
    this.nodes = [];
    this.completed = [];
    this.getFiles = this.getFiles.bind(this);
    this.loadFiles = this.loadFiles.bind(this);
  }

  init(onComplete = noop) {
    this.getFiles()
      .then(() => {
        this.loadFiles((node) => {
          this.completed.push(node.name);
          if (this.completed.length === this.nodes.length) {
            onComplete();
          }
        });
      })
      .catch((error) => console.log(error));
  }

  async getFiles() {
    const { source } = this.props;
    const data = await request({ url: source })
    this.getFilesTransform(data);
  }

  getFilesTransform(data) {
    const {
      type,
      dateRegularExpression,
      formatDate,
      contentParser,
      navigationHash,
    } = this.props;

    const links = this.processDataResponse(data);

    this.nodes = links
      .map(link => {
        const fileUrl = link.getAttribute('href');
        return this.isTypeUrl(fileUrl)
          ? new Node({
            type,
            fileUrl,
            dateRegularExpression,
            formatDate,
            contentParser,
            navigationHash,
          })
          : false;
      })
      .filter((node) => node !== false);

    this.nodes.sort(this._sortNodesByDate);
  }

  processDataResponse(data) {
    const container = dom.createElement('div');
    container.innerHTML = data;
    return [].slice.call(container.getElementsByTagName('a'));
  }

  loadFiles(onComplete = noop) {
    this.nodes.forEach((node) => {
      node.load(() => onComplete(node));
    });
  }

  isTypeUrl(url) {
    const { extension } = this.props;
    const fileExtension = url.split('.').pop();
    return fileExtension === extension.replace('.', '');
  }

  findBySlug(slug) {
    return this.nodes.find((node) => node.name === slug);
  }

  findBySlugAsync(slug, callback = noop) {
    const {
      source,
      extension,
    } = this.props;

    const filename = `${source}/${slug}${extension}`;

    request({ url: filename })
      .then(callback)
      .catch((error) => console.log(error));
  }

  _sortNodesByDate(n1, n2) {
    if (n1.time < n2.time) { return -1; }
    if (n1.time > n2.time) { return 1; }
    return 0;
  }
}

export default Collection;
