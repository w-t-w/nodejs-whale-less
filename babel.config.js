const babelConfig = {
    sourceType: 'unambiguous',
    presets: [[
        '@babel/preset-env',
        {
            modules: false,
            loose: false,
            useBuiltIns: 'usage',
            corejs: {
                version: 3,
                proposals: true
            }
        }
    ]]
};

module.exports = babelConfig;