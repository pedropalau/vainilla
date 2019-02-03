import Component from './Component.js';

import request from './utils/request.js';

class File extends Component {
  constructor(props) {
    super(props);
    this.content;
    this.getContent = this.getContent.bind(this);
    this.load = this.load.bind(this);
    this.loadContent = this.loadContent.bind(this);
  }

  getContent() {
    return this.content;
  }

  async load() {
    if (!this.content) {
      await this.loadContent();
    }
    return this.content;
  }

  async loadContent() {
    const { url } = this.props;
    const data = await request({ url });
    this.content = data;
  }
}

export default File;
