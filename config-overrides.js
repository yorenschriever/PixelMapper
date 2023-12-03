const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function override(config, env) {
    if (!config.plugins) {
        config.plugins = [];
    }

    config.plugins.push(
        new CopyWebpackPlugin({
            patterns:[
            {
                from: 'src/opencv',
                to: 'static/js',
            }
        ]})
    );

    return config
}