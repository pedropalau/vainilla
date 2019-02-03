import assign from './utils/assign.js';

class Component {
  constructor(props = {}) {
    const defaultProps = this.constructor.defaultProps || {};
    this.props = assign({}, defaultProps, props);
  }
}

Component.defaultProps = {
  /* default props */
}

export default Component;
