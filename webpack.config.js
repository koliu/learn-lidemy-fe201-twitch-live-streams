const webpack = require('webpack');

const CONFIG = {
    BUILD_PATH: `${__dirname}/dist/`,
    SRC_PATH: `${__dirname}/src/`
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

    plugins: []
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