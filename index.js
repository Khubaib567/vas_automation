const prompt = require('prompt-sync')();
const clientAuth = require('./utils/authClient');
const runSocket = require('../vas_automation/socket');
const {serverSocket,verfiyEmailSocket} = require('../vas_automation/socket');
const automate_prompt = require("./utils/automate-prompt")



const vasAutomate = async () => {
    clientAuth();
    const result =  await serverSocket();
    console.log("Result: ",result)
    if (result === true) {
        // automate_prompt()
        const verfiedEmail = await verfiyEmailSocket();
        console.log(verfiedEmail)
        if(verfiedEmail) automate_prompt()
        if(!verfiedEmail) console.log('Verification link is invalid or has expired!')
    }

    if (result === false) console.log('Authentication has failed!')

}


vasAutomate();



        