const Koa = require('koa');
const Koa_mount = require('koa-mount');

const factory = require('./factory');
const create_template = require('./template');

const run = config => {
    const koa = new Koa();

    koa.use(async (ctx, next) => {
        const {request, response} = ctx;

        const {url} = request;

        if (url === '/favicon.ico') {
            response.status = 200;
            response.body = '';
            return true;
        }

        await next();
    });

    Object.entries(config).forEach(([path, {framework_config, template}]) => {
        const module_koa = new Koa();

        koa.use(Koa_mount(path, module_koa));

        Object.entries(framework_config).reduce((result, [part_area, data_config]) => {
            const protocol = data_config['protocol'];
            factory.createRequester(protocol);
            result[part_area] = factory(data_config);
            return result;
        }, framework_config);

        module_koa.use(async ctx => {
            const {request, response} = ctx;

            const {query: {column_id}} = request;

            if (typeof column_id === 'undefined') {
                response.status = 400;
                response.body = '';
                return false;
            }

            const result = {};
            await Promise.all(Object.entries(framework_config).map(([part_area, data_config]) => {
                return data_config({column_id})
                    .then(res => {
                        result[part_area] = res.result;
                        return res.result;
                    });
            }));

            const {name, content} = template;
            const template_finally = create_template(name, content);

            try {
                response.status = 200;
                response.body = template_finally(result);
            } catch (err) {
                response.status = 500;
                response.body = err;
            }
        });
    });

    return koa;
};

module.exports = run;