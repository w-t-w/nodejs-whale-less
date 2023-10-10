const request = require('request');
const query_string = require('querystring');

let url = null;

const http = {
    compile: config => url = `${config.protocol}://${config.url}`,
    request(data) {
        return new Promise((resolve, reject) => {
            request(`${url}?${query_string.stringify(data)}`, (err, data, body) => {
                err ? reject(err) : resolve(body);
            });
        });
    }
};

module.exports = http;