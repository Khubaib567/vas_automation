const { createServer } = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

// Create HTTP server and Socket.IO instance
const httpServer = createServer();
const socket = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3000'
    }
});

// Promisify JWT verify
const verifyToken = (token, secret) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, user) => {
            if (err) {
                reject(err);
            } else {
                resolve(user);
            }
        });
    });
};

// Promisify HTTP server listen
const startServer = (server, port) => {
    return new Promise((resolve, reject) => {
        server.listen(port, () => {
            console.log(`Server is connected!`);
            resolve(true);
        }).on('error', (err) => {
            reject(err);
        });
    });
};

module.exports = serverSocket = () => {
    return new Promise(async (resolve, reject) => {
        try {
            // Start the HTTP server
            await startServer(httpServer, 4000);

            // Set up Socket.IO connection handler
            socket.on('connect', (socket) => {
                // Emit initial message
                socket.emit('message', 'Hello');

                // Handle form data submission
                socket.on('submitFormData', async (formData) => {
                    try {
                        const { code } = formData;
                        await verifyToken(code, process.env.JWT);
                        socket.emit('formResponse', {
                            message: 'Token Has Verified!',
                            status: true
                        });
                        resolve(true); // Resolve with true on successful verification
                    } catch (err) {
                        socket.emit('formResponse', {
                            message: 'Not authorized, token failed!',
                            status: false
                        });
                        resolve(false); // Resolve with false on failed verification
                    }
                });

                // Handle disconnection
                socket.on('disconnect', () => {
                    console.log('User disconnected');
                });
            });
        } catch (error) {
            console.error('Internal Server Error:', error);
            reject(error); // Reject promise on server error
        }
    });
};