if(process.env.NODE !== 'production'){
  require('dotenv').config({path:"../.secrets/.env"}); // Load environment variables from .env
}


const express = require('express')
const http = require("http");
const app = express()
const path = require('path')
const jwt = require('jsonwebtoken')
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server , {
     cors: {
        origin: 'http://localhost:4000'
    }
});
const port = 3000

// LOAD .ENV VARIABLES
const JWT_SECRET = process.env.JWT_SECRET;


// Set the views directory using an absolute path
app.use(express.static(path.join(__dirname, 'public')));


//  // Set EJS as the view engine
// app.set('view engine', 'ejs');


module.exports = auth = () =>{
    try {
        app.get('/', (req, res) => {
             res.sendFile(path.join(__dirname, 'public', 'index.html'));
             res.end()
        })

        app.get('/verify', (req, res) => {
        const token = req.query.token;
        // console.log('token: ',token)
        if (!token) {
            return res.status(400).send('Invalid verification link.');
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            // Here, you would update the user's status in your database
            // to mark their email as verified.
            console.log('User verified:', decoded.email);
            res.status(200).send('<h1>Email Verified Successfully!</h1><p>You can now log in.</p>');
            const message = "Verification Verified Successfully!"
            // io.emit("email-verified", message);
            io.clients().forEach(client => {
            if (client.readyState === socketIo.OPEN) {
                    client.emit('message', message);
                }
            });
            res.end()
        } catch (err) {
            res.status(400).send('Verification link is invalid or has expired.');
            return false;
        }
        });
        
        app.listen(port, () => {
            console.log(`Auth Gaurd at http://localhost:${port}`)
        })
        
    } catch (error) {
        console.error('Internal Server Error : ' , error)
    }

    // console.log('ABC')

}