var JoinPlugin = require("../../../");
const merge = require("merge");

module.exports = {
  entry: "./index",
  output: {
    libraryTarget: 'umd',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(json)$/i,
        use: [
          JoinPlugin.loader({name: 'result.json'})
        ]
      }
    ]
  },
  plugins: [
    new JoinPlugin({
      search: './src/**/*.json',
      skip: ['skip.json', /\/skipre.json/],
      join: function(common, addition) {
        return merge.recursive(
          common ? common : {},
          JSON.parse(addition)
        );
      },
      save: function(common) {
        return JSON.stringify(common);
      }
    })
  ]
};
