if(process.env.NODE !== "production") {
    require('dotenv').config({path : "../../.secrets/.env"})
}


// const axios = require('axios');

const { spawn } = require("child_process");
// const { execSync } = require("child_process");
const path = require("path");



module.exports =  update_subscription_in_bulk = async () => {

    // console.log(execSync("where perl || which perl").toString());

    try {


        // Example XML body (from client, form, or file)
        const xmlBody = `<user><name>Khubaib</name><subscription>true</subscription></user>`;

        const perlPath = path.join(__dirname , "subscription-api.pl");
        // Spawn Perl process
        const perl = spawn("perl", [perlPath], { stdio: ["pipe", "pipe", "pipe"] });

        // Send XML input to Perl via STDIN
        perl.stdin.write(xmlBody);
        perl.stdin.end();

        // Capture Perl script output (XML response)
        let output = "";
        perl.stdout.on("data", (data) => {
        output += data.toString();
        // console.log("Output:" , output)
        });

        perl.stderr.on("data", (data) => {
        console.error("Perl Error:", data.toString());
        });

        // Handle completion
        perl.on("close", (code) => {
        console.log(`Perl exited with code ${code}`);
        console.log("XML Response from Perl:\n", output);
        });

    

    } catch (error) {
        throw new Error("Error Updating Subscription in bulk " + error.message)
        
    }
}

// console.log("Running Script....")
// update_subscription_in_bulk()



