const path = require('path');
const fs = require('fs');

const requester_cache = {};

function factory(config) {
    const before = config.before || (data => data),
        then = config.then || (data => data),
        catch_able = config.catch || (error => error);

    const protocol = config['protocol'];
    const requester = requester_cache[protocol];

    requester.compile(config);

    return async (data) => {
        try {
            data = before(data);
        } catch (error) {
            console.error(error);
            return Promise.resolve(null);
        }

        return {
            result: await requester.request(data)
                .then(then)
                .catch(catch_able)
        };
    };
}

factory.createRequester = (name, requester) => {
    const default_requester_path = path.resolve(process.cwd(), `./core/requester/${name}/index.js`);
    if (typeof requester === 'undefined') {
        if (fs.existsSync(default_requester_path)) {
            requester_cache[name] = require(default_requester_path);
        } else {
            throw new TypeError('No default requester path exists!');
        }
    } else {
        if (!fs.existsSync(default_requester_path)) {
            requester_cache[name] = requester;
        } else {
            throw new TypeError('The default requester path cannot be customized!');
        }
    }
};

module.exports = factory;