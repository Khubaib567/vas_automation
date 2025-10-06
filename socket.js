const { createServer } = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

// FALL BACK TO HTTP SERVER IF SERVER GOES DOWN.
const httpServer = createServer();
const socket = new Server(httpServer , {
    cors:{
        origin:'http://localhost:3000'
        }
});

let status;

httpServer.listen(4000 , () => {
        console.log('Server is connected!');
})
  
socket.on('connect' , (socket) => {

    // console.log(socket);
    socket.emit('message' , 'Hello');

    // socket.on("message" , (data) =>{
    //    console.log(data)
    // })

    // Listen for a custom event named 'submitFormData'
    socket.on('submitFormData', async (formData) => {
    // console.log('Received form data:', formData);
    const { code } = formData;
    // console.log(typeof(process.env.JWT))
    try {
            status = await jwt.verify(code , process.env.JWT)
            // Optionally, send a response back to the client
            socket.emit('formResponse', {
            status: status,
            message: `Your pin code, ${code} has verified!`,
            });
    } catch (error) {
            // console.error('Error during authentication: ' , error);
            socket.emit('formResponse', {
            status: status,
            message: `Your pin code, ${code} has not verified!`,
            });
    } 
     
    });

     // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

});


 



