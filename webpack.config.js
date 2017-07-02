/**
 * @Create idler.zhu(zhuqiacheng@meizu.com)
 * @CreateDate  2017/4/23
 */
const path = require('path');
const webpack = require('webpack');
const globEntries = require('webpack-glob-entries');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const manifestPlugin = require('webpack-manifest-plugin');
const DefinePlugin = webpack.DefinePlugin;
const NoErrorsPlugin = webpack.NoErrorsPlugin;
const HotModuleReplacementPlugin = webpack.HotModuleReplacementPlugin;
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

module.exports = function (env) {
  let webpackConfig = {
    name: 'wechaty',
    entry: globEntries('./client/*.js'),
    output: {
      path: path.join(__dirname, '/public'),
      filename: 'js/[name].js',
      publicPath: '/'
    },
    devtool: 'source-map',
    module: {
      rules: [{
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            'presets': ['latest', 'stage-0', 'react'],
            'plugins': [
              'transform-decorators-legacy',
              ['import', {
                'libraryName': 'antd',
                'style': true
              }
              ]
            ]
          }
        }
      }, {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: "css-loader",
          publicPath: "../"
        })
      }, {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      }, {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'less-loader']
        })
      }, {
        test: /\.(svg|woff2?|eot|ttf)[\?]?[\S]*$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: 'font/[name]-[md5:hash:10].[ext]'
          }
        }],
      }, {
        test: /\.html$/,
        use: [{
          loader: 'html-loader',
          options: {
            minimize: true,
            collapseWhitespace: false,
            removeAttributeQuotes: false,
            interpolate: true,
            attrs: ['img:src', 'img:data-src', 'img:data-lazy']
          }
        }]
      }]
    },
    plugins: [],
    watchOptions: {
      ignored: /node_modules/
    }
  };

  let imageLoader = [{
    loader: 'url-loader',
    options: {
      limit: 5000,
      name: 'img/[name]-[md5:hash:10].[ext]'
    }
  }];
  // production 模式
  if (env === 'production') {
    webpackConfig.output.filename = 'js/[name].js';
    // 加入图片压缩
    imageLoader.push({
      loader: 'img-loader',
      options: {
        minimize: true,
        optimizationLevel: 5,
        progressive: true
      }
    });
    webpackConfig.devtool = 'source-map';
    // 导出所有样式文件
    webpackConfig.module.rules.push({
      test: /\.(png|jpe?g|gif|svg)$/i,
      use: imageLoader
    });
    // 导出css文件
    webpackConfig.plugins.push(
      new CommonsChunkPlugin({
        name: 'common'
      }),
      new ExtractTextPlugin('css/[name].css'),
      new NoErrorsPlugin(),
      // new manifestPlugin({
      //   fileName: 'manifest.json'
      // }),
      new DefinePlugin({
        'process.env.NODE_ENV': 'production'
      })
    );
  } else {
    webpackConfig.module.rules.push({
      test: /\.(png|jpe?g|gif|svg)$/i,
      use: imageLoader
    });

    webpackConfig.plugins.push(
      new ExtractTextPlugin('css/[name].css')
    );
   
  }
  return webpackConfig;
};
