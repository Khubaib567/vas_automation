const clientAuth = require('./utils/client-socket');
const serverAuth = require('./utils/server-socket');
const automate_prompt = require("./utils/automate-prompt")
const waitForVerification = require("./utils/email-verifier")
const storage = require('node-persist');

const vasAutomate = async () => {
   
    clientAuth();
    
    const result =  await serverAuth();
    // console.log("Result: ",result)
    
    if (result === true) {
        storage.initSync();
        await storage.setItem('status',false)
        const verfiedEmail = await waitForVerification(5)
        // console.log('verifiedEmail: ' , verfiedEmail)
        if(verfiedEmail) automate_prompt()

    }

    if (result === false) console.log('Authentication has failed!')

}


vasAutomate();



        