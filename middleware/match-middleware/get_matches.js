// Load dotenv only in non-production
// if (process.env.NODE !== 'production') {
//     require('dotenv').config();
// }

// IMPORT LIBRARIES & MODULES
// const cheerio = require('cheerio');
// const request = require('request');
const csvParser = require('../utils/csv-parser');
const jsonParser = require('../utils/json-parser');
const fs = require('fs');
const { get_League_url, get_match_details, get_summary } = require('./get_functions');

// FUNCTION TO FETCH LIVE MATCHES
const get_live_match = () => {
    request(process.env.LIVE_SCORE_URL, (err, res, html) => {
        if (!err && res.statusCode === 200) {
            const $ = cheerio.load(html);
            const container = $('div.page-container');
            const league = container.find('div.competition-matches');
            const matches_list = league.find('div.match-row-list');
            const matches_container = matches_list.find('div.match-row.match-row--status-pla').first();

            if (!matches_container.html()) {
                console.log("No live has been playing at this time!");
                console.log('System is exiting!');
                process.on('exit', code => console.log(`exiting the code ${code}`));
                setTimeout(() => process.kill(process.pid), 5000);
            } else {
                const matches = [];
                matches_container.each((i, el) => {
                    const date = $(el).find('span.match-row__date').text();
                    const time = $(el).find('span.match-row__state').text();
                    const score1 = $(el).find('td:nth-child(1) b.match-row__goals').text();
                    const team1_name = $(el).find('td.match-row__team-home span.match-row__team-name').text();
                    const score2 = $(el).find('td:nth-child(3) b.match-row__goals').text();
                    const team2_name = $(el).find('td.match-row__team-away span.match-row__team-name').text();
                    const match_details_link = $(el).find('a.match-row__link').attr('href');
                    const current_time = new Date();

                    get_match_details(match_details_link)
                        .then(get_details => {
                            const team1_badge_url = get_details.team1_badge;
                            const team2_badge_url = get_details.team2_badge;
                            const team1_goal_status = get_details.team1_goal_status[0]?.goal_scorer || "";
                            const team2_goal_status_len = get_details.team2_goal_status.length - 1;
                            const last_goal = get_details.team2_goal_status[team2_goal_status_len] || "";

                            const match = {
                                match_date: date,
                                match_time: time,
                                team1: team1_name,
                                team1_score: score1,
                                team2: team2_name,
                                team2_score: score2,
                                team1_badge: team1_badge_url,
                                team2_badge: team2_badge_url,
                                time_stamp: current_time,
                                team1_goal_status: team1_goal_status,
                                team2_goal_status: last_goal
                            };

                            matches.push(match);
                            console.log(matches);
                        })
                        .catch(console.error);
                });
            }
        }
    });
};

// ALL PAST MATCHES OF THE INPUT DATE
const get_past_matches = (league_name, date) => {
    const URL = get_League_url(league_name, date);
    request(URL, (err, res, html) => {
        if (!err && res.statusCode === 200) {
            const $ = cheerio.load(html);
            const body_tag = $('body.layout-low-end.page-competition-matches');
            const competition = body_tag.find('div.container-competition-matches');
            const match_div = competition.find('div.widget-competition-matches');
            const league_name = body_tag.find('div.page-container h1').text();

            console.log(league_name);
            const matches_container = match_div.find('div.match-row.match-row--status-pld').first();
            if (!matches_container) {
                console.log("No matches have been played on this date!");
            } else {
                matches_container.each((i, el) => {
                    const date = $(el).find('div.match-row__status span.match-row__date').text();
                    const team1 = $(el).find('table.match-row__teams td.match-row__team-home').text().trim();
                    const score1 = $(el).find('td:nth-child(1) b.match-row__goals').text().trim();
                    const team2 = $(el).find('table.match-row__teams td.match-row__team-away').text().trim();
                    const score2 = $(el).find('td:nth-child(3) b.match-row__goals').text().trim();
                    const current_time = new Date();
                    const match_details_link = $(el).find('a.match-row__link').attr('href');

                    get_match_details(match_details_link)
                        .then(get_details => {
                            console.log(get_details);
                        })
                        .catch(console.error);
                });
            }
        }
    });
};

// ALL NEXT MATCHES OF THE INPUT DATE
const get_next_matches = (league_name, date) => {
    const getURL = get_League_url(league_name, date);
    request(getURL, (err, res, html) => {
        if (!err && res.statusCode === 200) {
            const $ = cheerio.load(html);
            const body_tag = $('body.layout-low-end.page-competition-matches');
            const container = body_tag.find('div.page-container');
            const league_name = container.find('h1').text();
            console.log(league_name);

            const matches = container
                .find('div.container-competition-matches div.widget-competition-matches div.match-row.match-row--status-fix');

            const dateText = matches.find('div.match-row__status span.match-row__date').text();
            if (!dateText) {
                console.log("No fixtures have been found on this date!");
            } else {
                matches.each((i, el) => {
                    const date = $(el).find('div.match-row__status span.match-row__date').text();
                    const team1 = $(el).find('table.match-row__teams td.match-row__team-home').text();
                    const team2 = $(el).find('table.match-row__teams td.match-row__team-away').text();
                    console.log(`\n     ${date}\n${team1}-${team2}`);
                });
            }
        }
    });
};

// ALL PAST MATCHES SUMMARY WITH DATE WISE
const get_match_summary = (league_name, date) => {
    const URL = get_League_url(league_name, date);
    request(URL, (err, res, html) => {
        if (!err && res.statusCode === 200) {
            const $ = cheerio.load(html);
            const body_tag = $('body.layout-low-end.page-competition-matches');
            const competition = body_tag.find('div.container-competition-matches');
            const match_div = competition.find('div.widget-competition-matches');
            const league_name = body_tag.find('div.page-container h1').text();

            console.log(league_name);
            const matches_container = match_div.find('div.match-row.match-row--status-pld');

            const dateText = matches_container.find('div.match-row__status span.match-row__date').text();
            if (!dateText) {
                console.log("No matches have been played on this date!");
            } else {
                let links_arr = [];
                matches_container.each((i, el) => {
                    const match_details_link = $(el).find('a.match-row__link').attr('href');
                    links_arr.push(match_details_link);
                });

                let counter = 0;
                let interval = setInterval(() => {
                    if (counter > links_arr.length - 1) {
                        clearInterval(interval);
                    } else {
                        get_summary(links_arr[counter])
                            .then(summary => {
                                const team2_details = summary.team2_goals;
                                const team2_name = team2_details[0].name;
                                const first_goal = team2_details[1][0];
                                const second_goal = team2_details[1][1];
                                console.log(team2_name, first_goal, second_goal);
                            })
                            .catch(console.error);

                        counter++;
                    }
                }, 1000);
            }
        }
    });
};

// EXPORTS
module.exports = {
    get_live_match,
    get_past_matches,
    get_next_matches,
    get_match_summary
};
