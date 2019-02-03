import Component from './Component.js';

import keys from './utils/keys.js';
import assign from './utils/assign.js';
import noop from './utils/noop.js';

const DEFAULT_HASH = '#';
const DEFAULT_ROUTES = {};
const DEFAULT_ROOT = '/';
const MODE_HISTORY = 'history';
const MODE_HASH = 'hash';

const routeDefaultProps = {
  handler: noop,
};

const defaultProps = {
  hash: DEFAULT_HASH,
  routes: DEFAULT_ROUTES,
  root: DEFAULT_ROOT,
  onRouteNotFound: noop,
};

class Router extends Component {
  constructor(props) {
    super(props);
    this.routes = [];
    this.mode = this.determinateRouterMode();
    this.onHashChange = this.onHashChange.bind(this);
    this.init();
  }

  determinateRouterMode() {
    // if the current browser do not support html5 history api,
    // we need to get another mode type.
    // @todo resolve browser-compatible with history api.
    return (
      typeof window !== 'undefined'
      && window.history
      && window.history.pushState
    ) ? MODE_HISTORY : MODE_HASH;
  }

  init() {
    const { routes } = this.props;
    this.routes = keys(routes).map((index) => {
      const route = typeof routes[index] === 'function'
        ? { handler: routes[index] }
        : routes[index];
      // determinate the regular expression of the
      // route to find any match in the future
      const {
        expression,
        parameters,
      } = this.getRouteExpressionWithParameters(index);
      return assign({
        pattern: index,
        expression,
        parameters,
        exact: true,
        ...routeDefaultProps,
      }, route);
    });

    // listen to changes
    this.bindEvents();
  }

  getRouteExpressionWithParameters(route) {
    let parameters = [];

    const expression = new RegExp(route
      .replace(/([:*])(\w+)/g, (full, dots, name) => {
        parameters.push(name);
        // replace by a regexp valid pattern
        return '([^\/]+)';
      })
      .replace(/\*/g, '(?:.*)') + '(?:\/$|$)'
    );

    return {
      expression,
      parameters,
    };
  }

  getRouteExpressionParameters(match, parameters) {
    // if no parameters or match, don't continue
    if (!match || parameters.length === 0) {
      return null;
    }

    // per now, we only support one wildcard per route
    // @todo support more wildcards per route
    return match.slice(1, match.length);
  }

  bindEvents() {
    if (this.mode === MODE_HISTORY) {
      window.addEventListener('popstate', this.onHashChange);
    }
    else if (typeof window !== 'undefined' && window.onhashchange ) {
      window.addEventListener('hashchange', this.onHashChange);
    }
  }

  onHashChange() {
    // resolve the new request
    this.resolve();
  }

  /**
   * clear unnecessary slashes from the path
   */
  pathClean(path) {
    return path !== '/'
      ? path.replace(/\/$/, '').replace(/^\//, '')
      : path;
  }

  getFragment() {
    const { hash } = this.props;
    let fragment;
    if (this.mode === MODE_HISTORY) {
      fragment = this.pathClean(decodeURI(location.hash));
      fragment = fragment
        // replace the hash
        .replace(new RegExp('^' + hash), '')
        .replace(new RegExp(hash + '.*$'), '')
        .replace(`/${hash}$/`, '')
        // remove '/' from the start
        .replace(/^\//, '');
    }
    else {
      const match = window.location.href.match(`/${hash}(.*)$/`);
      fragment = this.pathClean(match ? match[1] : '');
    }
    return fragment;
  }

  resolve(path) {
    const { onRouteNotFound } = this.props;

    const fragment = (path || this.getFragment()).toString();
    let founded = false;
    for (let route of this.routes) {
      if (route.pattern === fragment) {
        founded = true;
        return route.handler();
      }
      // determinate if the fragment match the pattern
      const match = fragment.match(route.expression);
      if (match) {
        founded = true;
        const parameters = this.getRouteExpressionParameters(match, route.parameters);
        return route.handler.apply(null, parameters);
      }
    }

    if (!founded) {
      onRouteNotFound();
    }
  }
}

Router.defaultProps = defaultProps;

export default Router;
