module.exports = {
  // set your styleguidist configuration here
  title: 'Style Guide',
  // components: 'src/components/**/[A-Z]*.vue',
  defaultExample: false,
  sections: [
    {
      name: 'Views',
      components: 'src/views/**/[A-Z]*.vue'
    },
    {
      name: 'components',
      components: 'src/components/**/[A-Z]*.vue'
    }
  ],
  // webpackConfig: {
  //   // custom config goes here
  // },
  usageMode: 'expand',
  exampleMode: 'hide',
  styleguideDir: 'dist'
};
