if(process.env.NODE !=='production'){
    require('dotenv').config()
}

const cheerio = require('cheerio');
const request = require('request');

// LOOKUP TABLE
const league_lookup_table = {
    BASE_URL : process.env.BASE_URL,
    leagues: [
        {
            league1_name:"uefa-champions-league",
            league1_endpoint:process.env.UEFA_CHAMPIONSHIP_ENDPOINT
        },
        {
            league2_name:"championship",
            league2_endpoint:process.env.CHAMPIONSHIP_ENDPOINT
        },
        {
            league3_name:"premier-league",
            league3_endpoint:process.env.PREMIER_ENDPOINT
        },
        {
            league4_name:"world-cup",
            league4_endpoint:process.env.WORLD_CUP_ENDPOINT
        }
    ]
}

// CREATE FUNCTION TO EXTRACT THE URL A/C TO THE GIVEN INPUT TOURNAMNET
const get_League_url = (league_name,date)=>{
    if(league_name==league_lookup_table.leagues[0].league1_name){ // uefa-champions-league
        return league_lookup_table.BASE_URL+league_name+'/fixtures-results/'+date+league_lookup_table.leagues[0].league1_endpoint
    }
    if(league_name==league_lookup_table.leagues[1].league2_name){ //championship
        return league_lookup_table.BASE_URL+league_name+'/fixtures-results/'+date+league_lookup_table.leagues[1].league2_endpoint
    }
    if(league_name==league_lookup_table.leagues[2].league3_name){ //premier-league
        return league_lookup_table.BASE_URL+league_name+'/fixtures-results/'+date+league_lookup_table.leagues[2].league3_endpoint
    }
    if(league_name==league_lookup_table.leagues[3].league4_name){ //premier-league
        return league_lookup_table.BASE_URL+league_name+'/fixtures-results/'+date+league_lookup_table.leagues[3].league4_endpoint
    }
}


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
            resolve(team1_goals)  
        }else{
            reject('Something went wrong!')
            }   
        })

    })
    
}

//FUNCTION TO GET TEAM MATCH SUMMARY

const get_summary = (match_details_link) => {

    return new Promise((resolve,reject)=>{
        request('https://www.goal.com/'+match_details_link,(err,res,html)=>{
        if(!err && res.statusCode == 200){
            const $ = cheerio.load(html)
            const table = $('table')
            const team1_goal_scorer = table.find('tbody').find('tr:nth-child(2)').find('div.widget-match-header__scorers-names widget-match-header__scorers-names--empty widget-match-header__scorers-names--home')
            const team2_goal_scorer = table.find('tbody').find('tr:nth-child(2)').find('div.widget-match-header__scorers-names widget-match-header__scorers-names--empty widget-match-header__scorers-names--away')
            let team1_goals=[]
            let goal = {goal_scorer:null,goal_time:null};
            if(team1_goal_scorer.html()==null && team2_goal_scorer.html()==null){
                team1_goals.push(goal)
                resolve(team1_goals)
            }  
        }else{
            reject('Something went wrong!')
            }   
        })
  
    })
}


module.exports = {get_League_url,get_match_details,get_summary}