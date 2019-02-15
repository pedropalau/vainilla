import Component from './Component.js';
import Router from './Router.js';
import Template from './Template.js';
import Type from './Type.js';

import keys from './utils/keys.js';

import {
  HOMEPAGE,
  ARCHIVE,
  SINGLE,
  NOT_FOUND,
} from './constants/constants.js';

import { default as defaultProps } from './constants/defaults.js';

class Blog extends Component {
  constructor(props) {
    super(props);
    this.isReady = false;
    this.router = null;
    this.root = props.root || undefined;
    this.types = {};
    this.typesNames = [];
    this.bootstrapContentTypes = this.bootstrapContentTypes.bind(this);
    this.bootstrapRoutes = this.bootstrapRoutes.bind(this);
    this.bootstrapEvents = this.bootstrapEvents.bind(this);
    this.bootstrapPlugins = this.bootstrapPlugins.bind(this);
    this.bootstrapFinal = this.bootstrapFinal.bind(this);
    this.onTypeInitialized = this.onTypeInitialized.bind(this);
  }

  bootstrap() {
    this.bootstrapContentTypes();
  }

  bootstrapContentTypes() {
    const {
      types,
      extension,
      dateRegularExpression,
      formatDate,
      contentParser,
      navigationHash,
    } = this.props;

    types.forEach((type) => {
      this.types[type.name] = new Type({
        ...type,
        dateRegularExpression,
        formatDate,
        contentParser,
        extension,
        navigationHash,
        onInitialized: this.onTypeInitialized,
      });

      this.typesNames.push(type.name);
    });
  }

  bootstrapRoutes() {
    const { navigationHash } = this.props;

    if (!this.router) {
      let routes = { '/': () => this.render(HOMEPAGE) };

      this.typesNames.forEach((name) => {
        if (this.types[name]) {
          const type = this.types[name];
          routes[type.slug] = () => this.render(ARCHIVE, type.name);
          routes[`${type.name}/:slug`] = (slug) => this.render(SINGLE, type.name, slug);
        }
      });

      // prepare the routes object
      this.router = new Router({
        hash: navigationHash,
        onRouteNotFound: () => this.render(NOT_FOUND),
        // load routes from a different config file
        routes,
      });
    }
  }

  bootstrapEvents() {
    /* @todo */
  }

  bootstrapPlugins() {
    /* @todo */
  }

  bootstrapFinal() {
    this.bootstrapRoutes();
    this.bootstrapEvents();
    this.bootstrapPlugins();
  }

  onTypeInitialized() {
    const { types } = this.props;

    if (this.typesNames.length === types.length) {
      this.isReady = true;
      this.bootstrapFinal();
      this.executeActiveHandler();
    }
  }

  getType(name) {
    return this.types.hasOwnProperty(name)
      ? this.types[name]
      : undefined;
  }

  executeActiveHandler() {
    this.router.resolve();
  }

  render(page, arg1 = null, arg2 = null) {
    const {
      templatesPath,
      templatesExtension,
    } = this.props;

    let filename;
    let type;
    let variables = {};

    switch (page) {
      case ARCHIVE:
        filename = this.renderArchive(page, arg1, arg2, variables);
        break;

      case SINGLE:
        filename = this.renderSingle(page, arg1, arg2, variables);
        break;

      case HOMEPAGE:
        filename = this.renderFrontPage(page, arg1, arg2, variables);
        break;

      case NOT_FOUND:
        filename = this.renderNotFound(page, arg1, arg2, variables);
        break;
    }

    const templateFile = [
      templatesPath,
      `${filename || this.renderNotFound(page, arg1, arg2, variables)}.${templatesExtension}`,
    ];

    Template.render(templateFile.join('/'), variables, this.root);
  }

  renderArchive(page, arg1, arg2, variables) {
    const type = this.getType(arg1);
    let filename = page;

    if (type) {
      variables.posts = type.collection.nodes;
      filename = type.templates.archive;
    }

    return filename;
  }

  renderSingle(page, arg1, arg2, variables) {
    const type = this.getType(arg1);
    const single = this.findNodeBySlug(arg1, arg2);
    let filename = page;

    if (type && single) {
      variables[type.name] = single;
      filename = type.templates.single;
    }

    return filename;
  }

  renderFrontPage(page, arg1, arg2, variables) {
    return page;
  }

  renderNotFound(page, arg1, arg2, variables) {
    const { notFoundTemplate } = this.props;

    return notFoundTemplate;
  }

  findNodeBySlug(type, slug) {
    if (this.types[type]) {
      return this.types[type].collection.findBySlug(slug);
    }
  }
}

Blog.defaultProps = defaultProps;

export default Blog;
