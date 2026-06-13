// const { createServer } = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const crypto = require('crypto')
const {generateJwtToken , sendVerificationEmail } = require("./email-sender");
let isListening = false; // Track listening state

// Create HTTP server and Socket.IO instance
// const httpServer = createServer();
const express = require('express');
const app = express()
const http = require("http");
const server = http.createServer(app);

const socket = new Server(server, {
    cors: {
        origin: ['http://localhost:3000' , 'http://127.0.0.1:3000']
    }
});



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
            await startServer(server, 4000);
            
            // Set up Socket.IO connection handler
            socket.on('connect', (socket) => {
                // Emit initial message
                socket.emit('message', 'Hello');

                // Handle form data submission
                socket.on('submitFormData', async (formData) => {
                    try {
                        const { email } = formData;

                        const userId = crypto.randomUUID();
                        const userPayload = { email: email, userId: userId };
                        
                        const token =  generateJwtToken(userPayload);
                        // console.log("Token: ",userPayload)
                        await sendVerificationEmail(userPayload.email, token);
                        
                        socket.emit('formResponse', {
                            message: 'Verification email sent. Please check your inbox.',
                            status: true
                        });


                       resolve(true); // Resolve with true on successful verification

                    } catch (err) {
                        socket.emit('formResponse', {
                            message: 'Bad Request or Internal Server Error!',
                            status: false
                        });
                        reject(false); // Resolve with false on failed verification
        
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


// const getFunction = async () => {
//    await startServer(server, 4000);
//    const result = await closeServer(server);
//    console.log("Result: " , result)
// }

// getFunction()