const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const mkdirp = require('mkdirp');
const MFS = require('memory-fs');

const CONFIG_DIR = path.resolve(process.cwd(), './config');
const VIRTUAL_ROOT_PATH = '/w-t-w';

function upload(module_name, framework_config_name, template_name) {
    const TEMPLATE_DIR = path.resolve(process.cwd(), `./workspace/source/${module_name}/template/index.html`);
    const MODULE_DIR = path.resolve(CONFIG_DIR, module_name);
    mkdirp.sync(MODULE_DIR);

    const MODULE_TEMPLATE_DIR = path.resolve(MODULE_DIR, `${template_name}.tpl`);
    fs.createReadStream(TEMPLATE_DIR, 'utf-8').pipe(fs.createWriteStream(MODULE_TEMPLATE_DIR, 'utf-8'));

    const compiler = webpack({
        devtool: false,
        mode: 'development',
        target: 'node',
        stats: {
            preset: 'minimal'
        },
        entry: {
            [framework_config_name]: `./workspace/source/${module_name}/${framework_config_name}.js`
        },
        output: {
            path: VIRTUAL_ROOT_PATH,
            filename: '[name].js',
            chunkFilename: '[name].js',
            library: {
                type: 'umd'
            }
        },
        module: {
            rules: [{
                test: /\.js[x]?$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true
                    }
                }]
            }]
        }
    });

    const mfs = new MFS();
    compiler.outputFileSystem = mfs;

    compiler.run(() => {
        const read_stream = mfs.createReadStream(`${VIRTUAL_ROOT_PATH}/${framework_config_name}.js`);
        const MODULE_FRAMEWORK_DIR = path.resolve(MODULE_DIR, `${framework_config_name}.js`);
        read_stream.pipe(fs.createWriteStream(MODULE_FRAMEWORK_DIR, 'utf-8'));
    });
}

module.exports = upload;