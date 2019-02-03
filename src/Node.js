import Component from './Component.js';
import File from './File.js';

import assign from './utils/assign.js';
import dateToTimestamp from './utils/dateToTimestamp.js';
import noop from './utils/noop.js';

const defaultProps = {
  type: null,
  name: null,
  date: null,
  time: null,
  body: null,
  link: null,
};

class Node extends Component {
  constructor(props) {
    super(props);
    this.file;
    this.nodeInfoDivider = /^---$/m;
    // set the props as the object props
    assign(this, this.props);
    this.load = this.load.bind(this);
    this.parse = this.parse.bind(this);
    this.init();
  }

  init() {
    const {
      fileUrl: url,
    } = this.props;

    // I don't like the idea to give the current node, the
    // responsibility of working with the file itself
    this.file = new File({
      url,
    });
  }

  load(onComplete = noop) {
    this.file.load()
      .then(() => {
        this.parse();
        onComplete();
      })
      .catch(error => console.log(error));
  }

  parse() {
    this.parseName();
    this.parsePermalink();
    this.parsePostDate();
    this.parsePostInfo();
    this.parsePostBody();
  }

  parseName() {
    const { fileUrl } = this.props;

    this.name = fileUrl
      .substr(fileUrl.lastIndexOf('/'))
      .replace('/', '')
      .split('.')
      .slice(0, -1)
      .join('.');
  }

  parsePermalink() {
    const { navigationHash } = this.props;
    this.link = [navigationHash, this.type, this.name].join('/');
  }

  parsePostDate() {
    const {
      fileUrl,
      dateRegularExpression,
      formatDate,
    } = this.props;

    if (dateRegularExpression.test(fileUrl)) {
      this.date = formatDate(dateRegularExpression.exec(fileUrl)[0]);
      this.time = dateToTimestamp(this.date);
    }
  }

  /*
   * @todo
   * Move this to the File class. The node
   * itself don't need to parse the file content.
   */
  parsePostInfo() {
    const fileContent = this.file.getContent();
    const pattern = new RegExp('^(?:\r\n?|\n)*---([^]*?)---');

    if (fileContent.match(pattern)) {
      let attributes = {};
      pattern
        .exec(fileContent)[1]
        // remove unnecessary lines
        .replace(/(\r\n?|\n){2,}/g, '\n')
        // remove lines at start and end of the string
        .replace(/^\s+/g, '')
        .replace(/^\s+$/g, '')
        // two space identation
        .replace(/(\r\n?|\n) {2,}/g, ' ')
        // get individual lines
        .split(/\n/)
        // exclude non valid lines
        .filter(line => line !== "")
        // process each line to get the attribute:value pair
        .forEach((line) => {
          // split on ':'
          const parts = line.split(/:(.+)?/).filter(part => part !== "");
          if (parts.length === 2) {
            // line with attribute:value format valid
            const attribute = parts[0] && parts[0].trim();
            const value = parts[1] && parts[1].trim();
            // set the value into the object
            attributes[attribute] = value;
          }
        });

      // assign the found attributes to the object itself
      assign(this, attributes);
    }
  }

  /*
   * @todo
   * Move this to the File class. The node
   * itself don't need to parse the file content.
   */
  parsePostBody() {
    const { contentParser } = this.props;
    const fileContent = this.file.getContent();
    this.body = contentParser(
      fileContent
        .split(this.nodeInfoDivider)
        .splice(2)
        .join(this.nodeInfoDivider)
        // remove line-break at the start of the content
        .replace(/^\s+/g, '')
        // remove line-break at the end of the content
        .replace(/^\s+$/g, '')
    );
  }
}

Node.defaultProps = defaultProps;

export default Node;
