if(process.env.NODE !=='production'){
    require('dotenv').config()
}

const prompt = require('prompt-sync')();
const cheerio = require('cheerio');
const request = require('request');

//FUNCTION TO GET MATCH DETAILS
const get_match_details = (match_details_link) => {

    return new Promise((resolve,reject)=>{
        request('https://www.goal.com/'+match_details_link,(err,res,html)=>{
        if(!err && res.statusCode == 200){
            const $ = cheerio.load(html)
            const team1_name = $('div.widget-match-header__name').first().text() 
            const team1_badge_url = $('img.widget-match-header__logo').first().attr('src')
            const team2_name = $('div.widget-match-header__name').last().text()    
            const team2_badge_url = $('img.widget-match-header__logo').last().attr('src')
            
            // const goal_scorer_team1 = $('div.widget-match-header__scorers-names.widget-match-header__scorers-names--home').text().trim()
            // const goal_scorer_team2 = $('div.widget-match-header__scorers-names.widget-match-header__scorers-names--away').text().trim()
        
            // SCRAPE TEAMS GOALS WITH GOAL SCORER_NAME
            const container = $('div.page-container')
            const live_match = container.find('div.widget-match-header')
            const team1_goal_div = live_match.find('div.widget-match-header__scorers-names.widget-match-header__scorers-names--home')   
            const team2_goal_div = live_match.find('div.widget-match-header__scorers-names.widget-match-header__scorers-names--away')   
            
            //GET GOAL_SCORER INFORMATION  FOR TEAM_1
            let team1_goals=[]
            team1_goal_div.each((item,el)=>{
              let goal = {goal_scorer:null,goal_time:null};
              const total_goals = $(el).find('div').length
              if(total_goals == 0) return team1_goals.push(goal)
              else{
                for (item=0+1;item<=total_goals;item++){
                  const goal_scorer_name = team1_goal_div.find(`div:nth-child(${item})`).text().trim()
                  const goal_time_value = goal_scorer_name.substring(goal_scorer_name.indexOf('(')+1, goal_scorer_name.indexOf(')'));
                  // console.log(goal_time)
                //   goal = {goal_scorer:goal_scorer_name}
                  team1_goals.push(goal_scorer_name) 
                }
              }
            })
            
            //GET GOAL_SCORER INFORMATION  FOR TEAM_2
            let team2_goals=[]
            team2_goal_div.each((item,el)=>{
              let goal = {goal_scorer:null,goal_time:null};
              const total_goals = $(el).find('div').length
              if(total_goals == 0) return team2_goals.push(goal)
              else{
                for (item=0+1;item<=total_goals;item++){
                  const goal_scorer_name = team2_goal_div.find(`div:nth-child(${item})`).text().trim()
                  const goal_time_value = goal_scorer_name.substring(goal_scorer_name.indexOf('(')+1, goal_scorer_name.indexOf(')'));
                  // console.log(goal_time)
                  goal = {goal_scorer:goal_scorer_name,goal_time:goal_time_value}
                  team2_goals.push(goal) 
                }
              }
              
            }) 
            const json_format = {team1_goal_status:team1_goals,team1_badge:team1_badge_url,team2_goal_status:team2_goals,team2_badge:team2_badge_url}

            // console.log(team2_goals)
            resolve(json_format)  
        }else{
            reject('Something went wrong!')
            }   
        })

    })
}

const get_live_match =()=>{
    // setInterval(()=>{
        request(process.env.LIVE_SCORE_URL,(err,res,html)=>{
            if(!err && res.statusCode == 200){
                const $ = cheerio.load(html)
                // console.log($.html())
                const container = $('div.page-container')
                const league = container.find('div.competition-matches') 
                const matches_list = league.find('div.match-row-list')
                const matches_container = matches_list.find('div.match-row.match-row--status-pla').first()
                if(matches_container.html() == null) {
                    console.log("No live has been playing on this time!")
                    console.log('System is exiting!'); 
                    process.on('exit', function(code) { 
                    return console.log(`exiting the code ${code}`); 
                    }); 
                    setTimeout((function() { 
                    return process.kill(process.pid); 
                    }), 5000); 
                } 
                else{
                    const matches = []
                    matches_container.each((i,el)=>{
                    const date = $(el).find('span.match-row__date').text()
                    const time = $(el).find('span.match-row__state').text()
                    const score1 = $(el).find('td:nth-child(1)').find('b.match-row__goals').text()
                    const team1_name = $(el).find('td.match-row__team-home').find('span.match-row__team-name').text()
                    const score2 = $(el).find('td:nth-child(3)').find('b.match-row__goals').text()
                    const team2_name = $(el).find('td.match-row__team-away').find('span.match-row__team-name').text()
                    const match_details_link = $(el).find('a.match-row__link').attr('href') 
                    const current_time = new Date()
                    
                    get_match_details(match_details_link).then((get_details)=>{
                        const team1_badge_url = get_details.team1_badge
                        const team2_badge_url = get_details.team2_badge
                        const team1_goal_status = get_details.team1_goal_status[0].goal_scorer
                        const team2_goal_status= get_details.team2_goal_status.length-1
                        const last_goal = team2_goal_status[team2_goal_status]
                        
                        // const goal_status = get_details.goal_status[0]
                        const match = {match_date:date,match_time:time,team1:team1_name,team1_score:score1,team2:team2_name,team2_score:score2,team1_badge:team1_badge_url,team2_badge:team2_badge_url,time_stamp:current_time,team1_goal_status:team1_goal_status,team2_goal_status:last_goal}
                        
                    matches.push(match)
                    console.log(matches)
                    })
                    .catch((err)=>{
                        console.error(err)
                        })
                    })
                    // setTimeout(()=> csvParser(matches),5000)
                }       
            }
        })
    
    // },60000)
}

// get_live_match()


    
    