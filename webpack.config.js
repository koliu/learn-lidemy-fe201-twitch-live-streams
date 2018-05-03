const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const CONFIG = {
    BUILD_PATH: `${__dirname}/dist/`,
    SRC_PATH: `${__dirname}/src/`,
    PATHS_TO_CLEAN: [
        'dist', // removes 'dist' folder
        // 'build/*.*', // removes all files in 'build' folder
        // 'web/*.js' // removes all JavaScript files in 'web' folder
    ],
    CLEAN_OPTIONS: {
        // Absolute path to your webpack root folder (paths appended to this)
        // Default: root of your package
        root: __dirname,

        // exclude: ['shared.js'],

        // Write logs to console.
        verbose: true,

        // Use boolean "true" to test/emulate delete. (will not remove files).
        // Default: false - remove files
        dry: false,

        // If true, remove files on recompile. 
        // Default: false
        watch: false,

        // allow the plugin to clean folders outside of the webpack root.
        // Default: false - don't allow clean folder outside of the webpack root
        allowExternal: false,

        // perform clean just before files are emitted to the output dir
        // Default: false
        beforeEmit: false,
    }
}


const webpackConfig = {

    // 程式的入口點
    entry: `${CONFIG.SRC_PATH}js/index.js`,

    // 你要輸出到哪裡
    output: {
        path: CONFIG.BUILD_PATH,
    },

    // 載入哪些類型的檔案
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader', // npm install babel-loader
        }, {
            test: /(\.scss|\.css)$/,
            // 同時使用多個 loader 來解析 css
            // 順序：下(先用) -> 上(後用)
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: [{
                    loader: "css-loader",
                    options: {
                        // 啟用 css modules
                        modules: false,
                        // 指定 css 的類別名稱，預設為 import { className } from "./style.css" 的 className
                        // localIdentName: '[name]__[local]--[hash:base64:5]',
                        url: false,
                        minimize: true,
                        sourceMap: true
                    }
                }, {
                    loader: "postcss-loader",
                }, {
                    loader: "sass-loader",
                }]
            })
        }, {
            test: /(\.pug|\.jade)$/,
            use: {
                loader: "pug-loader"
            },
            exclude: "/node_modules/"
        }, ]
    },

    plugins: [
        new HtmlWebpackPlugin({
            /** Required **/
            // Inject style, script
            inject: false,
            template: `${CONFIG.SRC_PATH}/index.tmpl.pug`,

            /** Optional **/
            title: 'Custom template',
            filetype: 'pug'
        }),
        new CleanWebpackPlugin(CONFIG.PATHS_TO_CLEAN, CONFIG.CLEAN_OPTIONS),
    ]
}

switch (process.env.NODE_ENV.trim()) {
    case "dev":
        webpackConfig.devtool = '#eval-source-map';
        webpackConfig.output.filename = 'bundle.js';
        webpackConfig.plugins.push(new ExtractTextPlugin("index.css"));
        break;
    case "prod":
        webpackConfig.devtool = '#source-map';
        webpackConfig.output.filename = 'bundle-[chunkhash].js';
        webpackConfig.plugins.push(
            new webpack.BannerPlugin('版權所有，盜版必究！'),
            new UglifyJsPlugin(),
            new webpack.optimize.OccurrenceOrderPlugin(),
            new ExtractTextPlugin("index-[chunkhash].css")
        );
        break;
}

module.exports = webpackConfig;