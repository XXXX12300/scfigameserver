export class Network {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.handlers = {};
    }

    connect() {
        this.ws = new WebSocket('ws://' + window.location.host);
        
        this.ws.onopen = () => {
            console.log('Connected to server');
            this.isConnected = true;
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (this.handlers[data.type]) {
                this.handlers[data.type](data);
            }
        };

        this.ws.onclose = () => {
            console.log('Disconnected from server');
            this.isConnected = false;
        };
    }

    on(type, callback) {
        this.handlers[type] = callback;
    }

    sendInput(input) {
        if (!this.isConnected) return;
        this.ws.send(JSON.stringify({
            type: 'input',
            input: input
        }));
    }
}
