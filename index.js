const prompt = require('prompt-sync')();
const {get_live_match,get_past_matches,get_next_matches,get_match_summary} = require('./middleware/match-middleware/get_matches')    
const auth = require('./middleware/utils/authClient');
const runSocket = require('../vas_automation/socket');
const socketServer = require('../vas_automation/socket');



const vasAutomate = async () => {
    auth();
    let result;
    if (result === true) {
        console.log(`Welcome to FootBall Search Engine
    1-Get Live Matches 
    2-Last Match Schedule
    3-Next Match Schedule
    4-Get Match Summary`)

    const option = parseInt(prompt('Please select the following options: '))


    if(option == 1) {
        return get_live_match()
    }
    if(option == 2) {
        const league_name = prompt('Enter the league name: ').toLowerCase().replace(' ','-')
        const date = prompt('Enter the date in given format (yyyy-mm-dd): ').replaceAll(' ','-')
        return get_past_matches(league_name,date)
    }
    else if(option == 3) {
        const league_name = prompt('Enter the league name: ').toLowerCase().replace(' ','-')
        const date = prompt('Enter the date in given format (yyyy-mm-dd): ').replaceAll(' ','-')
        return get_next_matches(league_name,date)
    }
    else if(option == 4){
        const league_name = prompt('Enter the league name: ').toLowerCase().replace(' ','-')
        const date = prompt('Enter the date in given format (yyyy-mm-dd): ').replaceAll(' ','-')
        return get_match_summary(league_name,date)
    }
    else console.log('System is exited!')
    }

    if (result === false) console.log('Authentication has failed!')

}


vasAutomate();



        