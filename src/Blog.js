import Component from './Component.js';
import Router from './Router.js';
import Type from './Type.js';
import Template from './Template.js';

import keys from './utils/keys.js';

import defaults from './constants/defaults.js';

const HOMEPAGE = 'front-page';
const ARCHIVE = 'archive';
const SINGLE = 'post';
const NOT_FOUND = 'not-found';

class Blog extends Component {
  constructor(props) {
    super(props);
    this.types = {};
    this.typesNames = [];
    this.isReady = false;
    this.router = null;
    this.root = props.root || undefined;
    this.onInitialized = this.onInitialized.bind(this);
    this.bootstrap();
  }

  bootstrap() {
    this.bootstrapContentTypes();
    this.bootstrapRoutes();
    this.bootstrapEvents();
    this.bootstrapPlugins();
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
        onInitialized: this.onInitialized,
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

  onInitialized() {
    const { types } = this.props;

    if (this.typesNames.length === types.length) {
      // no more types to process
      this.isReady = true;
      // wait for it... :(
      setTimeout(() => { this.executeActiveHandler(); }, 1);
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
      notFoundTemplate,
    } = this.props;

    // variables for the template
    let variables = {};
    let type;

    // get the template filename
    let filename;
    switch (page) {
      // an archive page
      case ARCHIVE:
        type = this.getType(arg1);
        if (type) {
          variables.posts = type.collection.nodes;
          filename = type.templates.archive;
        }
        break;

      // a single post/page
      case SINGLE:
        type = this.getType(arg1);
        const single = this.findNodeBySlug(arg1, arg2);
        if (type && single) {
          variables[type.name] = single;
          filename = type.templates.single;
        }
        break;

      // the front-page
      case HOMEPAGE:
        filename = page;
        break;

      // error/404
      case NOT_FOUND:
        filename = notFoundTemplate;
        break;
    }

    // render the template file with variables
    if (filename) {
      const templateFile = `${templatesPath}/${filename}.${templatesExtension}`;
      Template.render(templateFile, variables, this.root);
    }
    else {
      // not found
      const templateFile = `${templatesPath}/${notFoundTemplate}.${templatesExtension}`;
      Template.render(templateFile, variables, this.root);
    }
  }

  findNodeBySlug(type, slug) {
    if (this.types[type]) {
      return this.types[type].collection.findBySlug(slug);
    }
  }
}

Blog.defaultProps = defaults;

export default Blog;
