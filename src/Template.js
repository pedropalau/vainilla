import request from './utils/request.js';
import noop from './utils/noop.js';

const DEFAULT_EXTENSION = 'html';

const Template = {
  load(filename, success = noop) {
    request({ url: filename })
      .then(success)
      .catch((error) => console.log(error));
  },

  processVariables(html, variables = {}) {
    const transliterateWildcards = JSON.stringify(html)
      .replace(/[\r\n]+/g, '\n')
      .replace(/^\s+|\s+$/gm, '')
      .replace(/[ \t]*<%/gm, '<%')
      .replace(/[ \t]*<%=/gm, '<%=')
      .replace(/%>[ \t]*/gm, '%>')
      .replace(/<%=(.+?)%>/g, '"+($1)+"')
      .replace(/<%(.+?)%>/g, '";$1\noutput+="');

    const evaluator = new Function(
      'variables',
      `
        let output = ${transliterateWildcards};
        return output;
      `
    );

    return evaluator(variables);
  },

  render(filename, variables, container) {
    this.load(filename, (data) => {
      const html = this.processVariables(data, variables);
      // @todo this is unsafe, I need to use another way
      // to set the html of an element safety
      container.innerHTML = html;
    });
  }
};

export default Template;
