const fs = require('fs');
const path = require('path');
const run = require('./run');

const PORT = 3000;

(async () => {
    const framework_config_path = path.resolve(process.cwd(), './config/play/framework.js');
    const template_path = path.resolve(process.cwd(), './config/play/template.html');

    const framework_config = require(framework_config_path);

    const template = await new Promise((resolve, reject) => {
        fs.readFile(template_path, 'utf-8', (err, data) => {
            err ? reject(err) : resolve(data);
        });
    });

    run({
        '/play': {
            framework_config,
            template: {
                name: template_path,
                content: template
            }
        }
    }).listen(PORT, () => {
        console.log(`The play page is running at http://localhost:${PORT}!`);
    });
})();