import Component from './Component.js';
import Node from './Node.js';

import dom from './utils/dom.js';
import request from './utils/request.js';
import noop from './utils/noop.js';

class Collection extends Component {
  constructor(props) {
    super(props);
    this.nodes = [];
    this.getFiles = this.getFiles.bind(this);
    this.loadFiles = this.loadFiles.bind(this);
  }

  init(onComplete = noop) {
    this.getFiles()
      .then(() => {
        this.loadFiles();
        onComplete();
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

    // I prefer to use .map function, instead of
    // .forEach because the first one is more
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

    // sort node posts by date
    this.nodes.sort(this._sortNodesByDate);
  }

  processDataResponse(data) {
    const container = dom.createElement('div');
    container.innerHTML = data;
    return [].slice.call(container.getElementsByTagName('a'));
  }

  loadFiles() {
    this.nodes.forEach((node) => {
      // load the content of the node
      node.load();
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

    // the filename to request
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
