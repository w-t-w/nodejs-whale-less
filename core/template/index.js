const fs = require('fs');
const vm = require('vm');

const template_cache = {};

const template_context = vm.createContext({
    _(val) {
        if (!val) return '';
        return val.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },
    include(name, data) {
        const template = template_cache[name] || createTemplate(name);
        return template(data);
    }
});

function createTemplate(name, content) {
    template_cache[name] = vm.runInNewContext(`(function(data) {
        with(data) {
            return \`${typeof content !== 'undefined' ? content : fs.readFileSync(name, 'utf-8')}\`;
        }
    });`, template_context);
    return template_cache[name];
}

module.exports = createTemplate;