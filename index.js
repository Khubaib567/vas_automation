const clientAuth = require('./utils/client-socket');
const serverAuth = require('./utils/server-socket');
const automate_prompt = require("./utils/automate-prompt")
const task_runner = require("./utils/python-runner")
const waitForVerification = require("./utils/email-verifier")
// const storage = require('node-persist');

const footBallScore = async () => {
   
    try {

    clientAuth();
    
    const result =  await serverAuth();
    // console.log("Result: ",result)
    
    if (result === true) {

        // console.log('result:' , result)
        const verfiedEmail = await waitForVerification(5)
        // console.log('verifiedEmail: ' , verfiedEmail)
        if(verfiedEmail) task_runner()

    }

    if (result === false) console.log('Authentication has failed!')
        
    } catch (error) {
        console.error("Error: " + error)
    }

}


footBallScore();



        