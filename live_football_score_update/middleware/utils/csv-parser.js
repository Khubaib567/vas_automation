const fs = require('fs')

module.exports = csv_parser = (matches) =>{

    fs.readFile('data.csv', 'utf8', function(err, data){
        if(data == undefined){  
            const writeStream = fs.createWriteStream('data.csv')
            // Write Headers
            writeStream.write(`Date,Match_Time,Team_1,Team1_Score,Team_2,Team2_Score,Team1_Bage_url,Team2_badge_url,Time_stamp\n`)
            for(i=0;i<=matches.length-1;i++){
            writeStream.write(`${matches[i].match_date},${matches[i].match_time},${matches[i].team1},${matches[i].team1_score},${matches[i].team2},${matches[i].team2_score},${matches[i].team1_badge},${matches[i].team2_badge},${matches[i].time_stamp}\n`)
            }
            console.log('File has saved!');
        }else{
            for(i=0;i<=matches.length-1;i++){
                fs.appendFileSync('data.csv',`${matches[i].match_date},${matches[i].match_time},${matches[i].team1},${matches[i].team1_score},${matches[i].team2},${matches[i].team2_score},${matches[i].team1_badge},${matches[i].team2_badge},${matches[i].time_stamp}\n`)
            }
                console.log('File has updated!');
            }
         })
}


