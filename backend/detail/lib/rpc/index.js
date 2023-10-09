const net = require('net');

class RPC {
    constructor({encode, decode, isReceiveComplete}) {
        this.encode = encode;
        this.decode = decode;
        this.isReceiveComplete = isReceiveComplete;
    }

    createServer(callback) {
        const tcp_server = net.createServer(socket => {
            let buffer = null,
                package_length = null,
                package_request = null;
            socket.on('data', data => {
                buffer = buffer && buffer.length ? Buffer.concat([buffer, data]) : data;
                while (buffer && buffer.length && (package_length = this.isReceiveComplete(buffer))) {
                    if (buffer.length === package_length) {
                        package_request = buffer;
                        buffer = null;
                    } else {
                        package_request = buffer.slice(0, package_length);
                        buffer = buffer.slice(package_length);
                    }

                    const {seq, result} = this.decode(package_request);

                    callback({
                        body: result,
                        socket
                    }, {
                        end: data => {
                            const buffer = this.encode(data, seq);
                            socket.write(buffer);
                        }
                    });
                }
            });
        });

        return {
            listen(...args) {
                tcp_server.listen.apply(tcp_server, args);
            }
        };
    }
}

module.exports = RPC;