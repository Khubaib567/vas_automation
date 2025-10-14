if(process.env.NODE !== 'production'){
  require('dotenv').config({path:"../.secrets/.env"}); // Load environment variables from .env
}


const express = require('express')
const app = express()
const path = require('path')
const jwt = require('jsonwebtoken')
const storage = require('node-persist');

const port = 3000

// LOAD .ENV VARIABLES
const JWT_SECRET = process.env.JWT_SECRET;


// Set the views directory using an absolute path
app.use(express.static(path.join(__dirname, 'public')));


module.exports = auth = async () =>{
    try {

        app.get('/', (req, res) => {
                res.sendFile(path.join(__dirname, 'public', 'index.html'));
        })
      
       
        app.get('/verify', async (req, res) => {
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

                // Send HTTP response
                res.status(200).send('<h1>Email Verified Successfully!</h1><p>You can now log in.</p>');
                
                storage.initSync();
                await storage.setItem('status',true)
                // console.log('result: ',result)
                res.end();
            } catch (err) {
                return res.status(400).send('Verification link is invalid or has expired.');
            }
        });

        app.listen(port, () => {
            console.log(`Auth Gaurd at http://localhost:${port}`)
        })
    
    
    } catch (error) {
        console.error('Internal Server Error : ' , error)
    }


}