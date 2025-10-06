const express = require('express')
const app = express()
const path = require('path')
const port = 3000


// Set the views directory using an absolute path
app.use(express.static(path.join(__dirname, 'public')));


//  // Set EJS as the view engine
// app.set('view engine', 'ejs');


module.exports = auth = () =>{
    try {
        app.get('/', (req, res) => {
             res.sendFile(path.join(__dirname, 'public', 'index.html'));
        })

        app.listen(port, () => {
            console.log(`Auth Gaurd at http://localhost:${port}`)
        })
        
    } catch (error) {
        console.error('Internal Server Error : ' , error)
    }

    // console.log('ABC')

}