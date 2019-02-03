export default {
  types: [{
    name: 'post',
    source: 'content/posts',
    label: 'Posts',
    slug: 'posts',
    templates: {
      archive: 'posts',
      single: 'post',
    }
  }],
}
