// const { createServer } = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const crypto = require('crypto')
const {generateJwtToken , sendVerificationEmail } = require("./utils/email-sender");
let isListening = false; // Track listening state

// Create HTTP server and Socket.IO instance
// const httpServer = createServer();
const express = require('express');
const app = express()
const http = require("http");
const server = http.createServer(app);

const socket = new Server(server, {
    cors: {
        origin: 'http://localhost:3000'
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

const closeServer = (server) => {
    return new Promise((resolve, reject) => {
        server.close((err) => {
            if (err) {
                reject(err);
            } else {
                console.log('Server is closed!');
                resolve(true);
            }
        });

        // console.log('Server is Closed')
    });
};

const serverSocket = () => {
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


                    //    await closeServer(server);
                       resolve(true); // Resolve with true on successful verification

                    } catch (err) {
                        socket.emit('formResponse', {
                            message: 'Bad Request or Internal Server Error!',
                            status: false
                        });
                        resolve(false); // Resolve with false on failed verification
                    }

                });
            });
               
            // Handle disconnection
            socket.on('disconnect', () => {
                console.log('User disconnected');
            });
        } catch (error) {
            console.error('Internal Server Error:', error);
            reject(error); // Reject promise on server error
        }
    });
};


const verfiyEmailSocket = () =>{
    return new Promise(async(resolve,reject) =>{
        try {

            // await startServer(server, 4000);
            socket.on('connect' ,  (socket)=>{
                // Set a timeout to prevent hanging (e.g., 10 seconds)
                // const timeout = setTimeout(() => {
                // reject(new Error("Verification timed out"));
                // }, 10000);

                // Listen for email-verified event with a callback function
                socket.on("email-verified", async (data) => {
                console.log('Data: ',data)
                // clearTimeout(timeout); // Clear the timeout on success
                // await closeServer(server);
                if (data.message === "Verification Verified Successfully!") {
                    resolve(true); // Resolve with true
                } else {
                    reject(new Error("Unexpected verification message"));
                }
                });
            })

            // Handle disconnection
            socket.on('disconnect', () => {
                console.log('User disconnected');
            });
 
        } catch (error) {
             console.error('Internal Server Error:', error);
             reject(error); // Reject promise on server error
        }
    })
}



module.exports = {serverSocket,verfiyEmailSocket}

// const getFunction = async () => {
//    await startServer(server, 4000);
//    const result = await closeServer(server);
//    console.log("Result: " , result)
// }

// getFunction()