/**
 * Markdown (.md) files renderer
 * @thanks https://gist.github.com/renehamburger/12f14a9bd9297394e5bd
 */

const rules = [
  // headers
  {
    regex: /(#+)(.*)/g,
    replacement: (text, chars, content) => {
      var level = chars.length;
      return '<h' + level + '>' + content.trim() + '</h' + level + '>';
    },
  },
  // image
  {
    regex: /!\[([^[]+)\]\(([^)]+)\)/g,
    replacement: '<img src=\'$2\' alt=\'$1\'>',
  },
  // hyperlink
  {
    regex: /\[([^[]+)\]\(([^)]+)\)/g,
    replacement: '<a href=\'$2\'>$1</a>',
  },
  // bold
  {
    regex: /(\*\*|__)(.*?)\1/g,
    replacement: '<strong>$2</strong>',
  },
  // emphasis
  {
    regex: /(\*|_)(.*?)\1/g,
    replacement: '<em>$2</em>',
  },
  // del
  {
    regex: /~~(.*?)~~/g,
    replacement: '<del>$1</del>',
  },
  // quote
  {
    regex: /\n(&gt;|>)(.*)/g,
    replacement: (text, tmp, item) => {
      return '\n<blockquote>' + item.trim() + '</blockquote>';
    },
  },
  // block code
  {
    regex: /```[a-z]*\n[\s\S]*?\n```/g,
    replacement: (text) => {
      text = text.replace(/```/gm, '');
      return '<pre>' + text.trim() + '</pre>';
    },
  },
  // js code
  {
    regex: /&&&[a-z]*\n[\s\S]*?\n&&&/g,
    replacement: (text) => {
      text = text.replace(/```/gm, '');
      return '<script type="text/javascript">' + text.trim() + '</script>';
    },
  },
  // inline code
  {
    regex: /`(.*?)`/g,
    replacement: '<code>$1</code>',
  },
  // ul lists
  {
    regex: /\n\*(.*)/g,
    replacement: (text, item) => {
      return '\n<ul>\n\t<li>' + item.trim() + '</li>\n</ul>';
    },
  },
  // ol lists
  {
    regex: /\n[0-9]+\.(.*)/g,
    replacement: (text, item) => {
      return '\n<ol>\n\t<li>' + item.trim() + '</li>\n</ol>';
    },
  },
  // blockquotes
  {
    regex: /\n(&gt;|>)(.*)/g,
    replacement: (text, tmp, item) => {
      return '\n<blockquote>' + item.trim() + '</blockquote>';
    },
  },
  // horizontal rule
  {
    regex: /\n-{5,}/g,
    replacement: '\n<hr />',
  },
  // add paragraphs
  {
    regex: /\n([^\n]+)\n/g,
    replacement: (text, line) => {
      var trimmed = line.trim();
      if (/^<\/?(ul|ol|li|h|p|bl)/i.test(trimmed)) {
        return '\n' + line + '\n';
      }
      return '\n<p>' + trimmed + '</p>\n';
    },
  },
  // fix extra ul
  {
    regex: /<\/ul>\s?<ul>/g,
    replacement: '',
  },
  // fix extra ol
  {
    regex: /<\/ol>\s?<ol>/g,
    replacement: '',
  },
  // fix extra blockquote
  {
    regex: /<\/blockquote><blockquote>/g,
    replacement: '\n',
  }
];

export default function Markdown(text) {
  let textToParse = `\n${text}\n`;
  rules.forEach((rule) => {
    textToParse = textToParse.replace(rule.regex, rule.replacement);
  });

  // return the html without any line-break
  return textToParse.replace(/\r?\n|\r/g, '');
}
