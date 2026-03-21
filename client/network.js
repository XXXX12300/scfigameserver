export class Network {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.handlers = {};
    }

    connect() {
        // Socket.io auto-serves its client script at /socket.io/socket.io.js
        this.socket = io({
            transports: ['websocket'],  // Skip polling, pure WebSocket
            reconnection: true,
            reconnectionDelay: 500,
            reconnectionAttempts: 10
        });
        
        this.socket.on('connect', () => {
            console.log('Connected to server via Socket.io');
            this.isConnected = true;
            if (this.handlers['connect_success']) {
                this.handlers['connect_success']();
            }
        });

        this.socket.on('data', (dataStr) => {
            const data = JSON.parse(dataStr);
            if (this.handlers[data.type]) {
                this.handlers[data.type](data);
            }
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.isConnected = false;
        });
    }

    on(type, callback) {
        this.handlers[type] = callback;
    }

    sendInput(input) {
        if (!this.isConnected) return;
        this.socket.emit('data', JSON.stringify({
            type: 'input',
            input: input
        }));
    }
    
    // Backwards compatible .ws property so main.js code works unchanged
    get ws() {
        return {
            send: (payload) => {
                if (this.socket && this.isConnected) {
                    this.socket.emit('data', payload);
                }
            }
        };
    }
}
