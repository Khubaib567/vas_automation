if(process.env.NODE !=='production'){
    require('dotenv').config()
}

const cheerio = require('cheerio');
const axios = require('axios')

//FUNCTION TO GET MATCH DETAILS
const get_match_details = async (match_details_link) => {
  try {
    const { data: html } = await axios.get(`https://www.goal.com/${match_details_link}`);
    const $ = cheerio.load(html);

    const team1_name = $("div.widget-match-header__name").first().text();
    const team1_badge_url = $("img.widget-match-header__logo").first().attr("src");
    const team2_name = $("div.widget-match-header__name").last().text();
    const team2_badge_url = $("img.widget-match-header__logo").last().attr("src");

    const container = $("div.page-container");
    const live_match = container.find("div.widget-match-header");
    const team1_goal_div = live_match.find("div.widget-match-header__scorers-names.widget-match-header__scorers-names--home");
    const team2_goal_div = live_match.find("div.widget-match-header__scorers-names.widget-match-header__scorers-names--away");

    // GET GOAL_SCORER INFORMATION FOR TEAM_1
    const team1_goals = [];
    team1_goal_div.each((_, el) => {
      const total_goals = $(el).find("div").length;
      if (total_goals === 0) {
        team1_goals.push({ goal_scorer: null, goal_time: null });
      } else {
        for (let i = 1; i <= total_goals; i++) {
          const goal_scorer_name = $(el).find(`div:nth-child(${i})`).text().trim();
          const goal_time_value = goal_scorer_name.substring(
            goal_scorer_name.indexOf("(") + 1,
            goal_scorer_name.indexOf(")")
          );
          team1_goals.push({ goal_scorer: goal_scorer_name, goal_time: goal_time_value });
        }
      }
    });

    // GET GOAL_SCORER INFORMATION FOR TEAM_2
    const team2_goals = [];
    team2_goal_div.each((_, el) => {
      const total_goals = $(el).find("div").length;
      if (total_goals === 0) {
        team2_goals.push({ goal_scorer: null, goal_time: null });
      } else {
        for (let i = 1; i <= total_goals; i++) {
          const goal_scorer_name = $(el).find(`div:nth-child(${i})`).text().trim();
          const goal_time_value = goal_scorer_name.substring(
            goal_scorer_name.indexOf("(") + 1,
            goal_scorer_name.indexOf(")")
          );
          team2_goals.push({ goal_scorer: goal_scorer_name, goal_time: goal_time_value });
        }
      }
    });

    return {
      team1_name,
      team1_badge: team1_badge_url,
      team1_goal_status: team1_goals,
      team2_name,
      team2_badge: team2_badge_url,
      team2_goal_status: team2_goals,
    };
  } catch (error) {
    throw new Error("Something went wrong!");
  }
};


module.exports = getLiveMatch = async () => {
  try {
    const { data: html } = await axios.get(process.env.LIVE_SCORE_URL);
    const $ = cheerio.load(html);

    const container = $("div.page-container");
    const league = container.find("div.competition-matches");
    const matches_list = league.find("div.match-row-list");
    const matches_container = matches_list.find("div.match-row.match-row--status-pla").first();

    if (!matches_container.html()) {
      console.log("No live matches are being played right now!");
      console.log("System is exiting...");

      setTimeout(() => {
        process.exit(0);
      }, 5000);

      return [];
    }

    const matches = [];

    const promises = matches_container.map(async (i, el) => {
      const date = $(el).find("span.match-row__date").text();
      const time = $(el).find("span.match-row__state").text();
      const score1 = $(el).find("td:nth-child(1) b.match-row__goals").text();
      const team1_name = $(el).find("td.match-row__team-home span.match-row__team-name").text();
      const score2 = $(el).find("td:nth-child(3) b.match-row__goals").text();
      const team2_name = $(el).find("td.match-row__team-away span.match-row__team-name").text();
      const match_details_link = $(el).find("a.match-row__link").attr("href");
      const current_time = new Date();

      try {
        const get_details = await get_match_details(match_details_link);

        const team1_badge_url = get_details.team1_badge;
        const team2_badge_url = get_details.team2_badge;
        const team1_goal_status = get_details.team1_goal_status.map((g) => g.goal_scorer);
        const team2_goal_status = get_details.team2_goal_status.map((g) => g.goal_scorer);

        const last_goal = team2_goal_status.length > 0 ? team2_goal_status[team2_goal_status.length - 1] : null;

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
          team1_goal_status,
          team2_goal_status,
          last_goal,
        };

        matches.push(match);
      } catch (err) {
        console.error("Error fetching match details:", err.message);
      }
    }).get();

    await Promise.all(promises);

    console.log(matches);
    return matches;

  } catch (error) {
    console.error("Something went wrong fetching live matches:", error.message);
    return [];
  }
};



// get_live_match()


    
    