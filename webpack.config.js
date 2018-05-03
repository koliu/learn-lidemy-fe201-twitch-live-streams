const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');

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
        filename: 'bundle.js'
    },

    // 載入哪些類型的檔案
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader', // npm install babel-loader
        }]
    },

    plugins: [
        new CleanWebpackPlugin(CONFIG.PATHS_TO_CLEAN, CONFIG.CLEAN_OPTIONS),
    ]
}

switch (process.env.NODE_ENV.trim()) {
    case "dev":
        webpackConfig.devtool = '#cheap-module-eval-source-map';
        break;
    case "prod":
        webpackConfig.devtool = '#source-map';
        webpackConfig.plugins.push(
            new webpack.BannerPlugin('版權所有，盜版必究！')
        );
        break;
}

module.exports = webpackConfig;