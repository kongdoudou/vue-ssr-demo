const webpack = require('webpack');
const utils = require('./utils');
const config = require('../config');
const merge = require('webpack-merge');
const base = require('./webpack.base.conf');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');

// 获取所有模块列表
const moduleToBuild = require('./module-conf').getModuleToBuild() || [];
function getEntries() {
  // 初始化入口配置
  const entry = {};
  // 所有模块的列表
  // 根据传入的待打包目录名称，构建多入口配置
  for (let module of moduleToBuild) {
    entry[module] = `./src/components/${module}/entry-server.js`
  }
  return entry
}


// 组装多个（有几个module就有几个htmlWebpackPlugin）htmlWebpackPlugin，然后追加到配置中
const htmlWebpackPlugins = []

// 判断一下是否为分开打包模式
if (process.env.MODE_ENV === 'separate') {
  // 分开打包时是通过重复运行指定模块打包命令实现的，所以每次都是单个html文件，只要配置一个htmlPlugin
  htmlWebpackPlugins.push(new HtmlWebpackPlugin({
    filename: process.env.NODE_ENV === 'testing'
      ? 'index.html'
      : config.build.index,
    // template: 'index.html',
    template: config.build.htmlTemplate,
    inject: true,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true
      // more options:
      // https://github.com/kangax/html-minifier#options-quick-reference
    },
    // necessary to consistently work with multiple chunks via CommonsChunkPlugin
    chunksSortMode: 'dependency'
  }))
} else {
  // 一起打包时是通过多入口实现的，所以要配置多个htmlPlugin
  for (let module of moduleToBuild) {
    htmlWebpackPlugins.push(new HtmlWebpackPlugin({
      filename: `${module}.html`,
      template: `./src/components/${module}/index.html`,
      inject: true,
      // 这里要指定把哪些chunks追加到html中，默认会把所有入口的chunks追加到html中，这样是不行的
      chunks: ['vendor', 'manifest', module],
      // filename: process.env.NODE_ENV === 'testing'
      //   ? 'index.html'
      //   : config.build.index,
      // template: 'index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }))
  }
}


module.exports = merge(base, {
  entry: getEntries,
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  // 这允许 webpack 以 Node 适用方式(Node-appropriate fashion)处理动态导入(dynamic import)，
  // 并且还会在编译 Vue 组件时，
  // 告知 `vue-loader` 输送面向服务器代码(server-oriented code)。
  target: 'node',
  // 对 bundle renderer 提供 source map 支持
  devtool: '#source-map',
  // 此处告知 server bundle 使用 Node 风格导出模块(Node-style exports)
  output: {
    filename: '[name]-server-bundle.js',
    libraryTarget: 'commonjs2'
  },
  // https://webpack.js.org/configuration/externals/#function
  // https://github.com/liady/webpack-node-externals
  // 外置化应用程序依赖模块。可以使服务器构建速度更快，
  // 并生成较小的 bundle 文件。
  externals: nodeExternals({
    // 不要外置化 webpack 需要处理的依赖模块。
    // do not externalize CSS files in case we need to import it from a dep
    whitelist: /\.css$/
  }),
  plugins: [
    // 这是将服务器的整个输出构建为单个 JSON 文件的插件。
    // 默认文件名为 `vue-ssr-server-bundle.json`
    new VueSSRServerPlugin(),
    new ExtractTextPlugin({
      filename: utils.assetsPath('css/[name].[contenthash].css'),
      // Setting the following option to `false` will not extract CSS from codesplit chunks.
      // Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
      // It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`,
      // increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
      allChunks: true,
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.VUE_ENV': '"server"'
    })
  ].concat(htmlWebpackPlugins)
});
