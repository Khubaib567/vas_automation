const prompt = require('prompt-sync')();
const auth = require('./middleware/utils/authClient');
const runSocket = require('../vas_automation/socket');
const serverSocket = require('../vas_automation/socket');
const automate_prompt = require("./utils/automate-prompt")



const vasAutomate = async () => {
    auth();
    let result = await serverSocket();
    // console.log(result)
    if (result === true) {
        automate_prompt()
    }

    if (result === false) console.log('Authentication has failed!')

}


vasAutomate();



        