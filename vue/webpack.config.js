// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * @package    mod_page
 * @copyright  2021 Adrian Stritzinger <Adrian.Stritzinger@studium.fernuni-hagen.de>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
var path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin'); 
const TerserPlugin = require('terser-webpack-plugin');
const {VueLoaderPlugin} = require('vue-loader');
var webpack = require('webpack');


module.exports = (env, options) => {
    const exports = {
        entry: './src/main.js',
        output: {
            path: path.resolve(__dirname, '../amd/build'),
            publicPath: '/dist/',
            filename: 'app-lazy.min.js',
            chunkFilename: '[id].app-lazy.min.js?v=[hash]',
            libraryTarget: 'amd',
        },
        module: {
            rules: [
                {
                    test: /\.js?$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/
                },
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        'vue-style-loader',
                        // Creates `style` nodes from JS strings
                        "css-loader",
                        // Translates CSS into CommonJS
                        "css-loader",
                        // Compiles Sass to CSS
                        "sass-loader"
                    ],
                },
                {
                    test: /\.vue$/,
                    loader: 'vue-loader',
                    options: {
                        loaders: {
                            scss: 'vue-style-loader!css-loader!sass-loader'
                        },
                    }
                },
                {
                    test: /\.(eot|svg|ttf|woff|woff2)$/,
                    loader: 'url-loader'
                }
            ]
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),
                vue$: 'vue/dist/vue.esm-bundler.js',
            },
            extensions: ['*', '.js', '.vue', '.json']
        },
        devServer: {
            historyApiFallback: true,
            noInfo: true,
            overlay: true,
            headers: {
                'Access-Control-Allow-Origin': '\*'
            },
            disableHostCheck: true,
            https: true,
            public: 'https://127.0.0.1:8080',
            hot: true,
        },
        performance: {
            hints: false
        },
        devtool: 'source-map',
        plugins: [
            //new BundleAnalyzerPlugin(),
            new VueLoaderPlugin(),
        ],
        watchOptions: {
            ignored: /node_modules/
        },
        externals: {
            'core/ajax': {
                amd: 'core/ajax'
            },
            'core/str': {
                amd: 'core/str'
            },
            'core/modal_factory': {
                amd: 'core/modal_factory'
            },
            'core/modal_events': {
                amd: 'core/modal_events'
            },
            'core/fragment': {
                amd: 'core/fragment'
            },
            'core/yui': {
                amd: 'core/yui'
            },
            'core/localstorage': {
                amd: 'core/localstorage'
            },
            'core/notification': {
                amd: 'core/notification'
            },
            'core/pubsub': {
              amd: 'core/pubsub'
            },
            jquery: {
                amd: 'jquery'
            }
        }
    };
    if (options.mode === 'production') {
        //exports.devtool = false;
        // http://vue-loader.vuejs.org/en/workflow/production.html
        // exp
        exports.plugins = (exports.plugins || []).concat([
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: '"production"'
                }
            }),
            new webpack.LoaderOptionsPlugin({
                minimize: true
            })
        ]);
        exports.optimization = {
            minimizer: [
                new UglifyJsPlugin({
                    uglifyOptions: {
                      output: {
                        comments: false
                      }
                    }
                }),
                new TerserPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: true,
                }),
            ]
        };
    }
    return exports;
};

