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
        test: /\.(yaml-json)$/i,
        use: [
          JoinPlugin.loader(),
          'yaml-loader'
        ]
      }
    ]
  },
  plugins: [
    new JoinPlugin({
      search: './src/**/*.yaml-json',
      group:'[name]',
      name: '[name].[ext]',
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
