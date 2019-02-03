import Component from './Component.js';
import Collection from './Collection.js';

import assign from './utils/assign.js';
import noop from './utils/noop.js';

const defaultProps = {
  name: null,
  source: null,
  label: null,
};

class Type extends Component {
  constructor(props) {
    super(props);
    assign(this, props);
    this.collection;
    this.setCollection();
  }

  setCollection(onComplete = noop) {
    if (!this.collection) {
      const {
        source,
        extension,
        dateRegularExpression,
        formatDate,
        contentParser,
        onInitialized,
        navigationHash,
        name: type,
      } = this.props;

      this.collection = new Collection({
        source,
        extension,
        dateRegularExpression,
        formatDate,
        contentParser,
        navigationHash,
        type,
      });

      this.collection.init(onInitialized);
    }
  }

  getCollection() {
    return this.collection;
  }
}

Type.defaultProps = defaultProps;

export default Type;
