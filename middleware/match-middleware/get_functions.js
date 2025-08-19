// matchService.js
const dotenv = require("dotenv");
const axios = require("axios");
const cheerio = require("cheerio");

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// LOOKUP TABLE
const league_lookup_table = {
  BASE_URL: process.env.BASE_URL,
  leagues: [
    { name: "uefa-champions-league", endpoint: process.env.UEFA_CHAMPIONSHIP_ENDPOINT },
    { name: "championship", endpoint: process.env.CHAMPIONSHIP_ENDPOINT },
    { name: "premier-league", endpoint: process.env.PREMIER_ENDPOINT },
    { name: "world-cup", endpoint: process.env.WORLD_CUP_ENDPOINT }
  ]
};

// ✅ Get League URL dynamically
const getLeagueUrl = (league_name, date) => {
  const league = league_lookup_table.leagues.find((l) => l.name === league_name);
  if (!league) return null;
  return `${league_lookup_table.BASE_URL}${league_name}/fixtures-results/${date}${league.endpoint}`;
};

// ✅ Get Match Details
const getMatchDetails = async (match_details_link) => {
  try {
    const { data: html } = await axios.get(`https://www.goal.com/${match_details_link}`);
    const $ = cheerio.load(html);

    const team1_badge_url = $("img.widget-match-header__logo").first().attr("src") || null;
    const team2_badge_url = $("img.widget-match-header__logo").last().attr("src") || null;

    const container = $("div.page-container");
    const live_match = container.find("div.widget-match-header");
    const team1_goal_div = live_match.find("div.widget-match-header__scorers-names--home");
    const team2_goal_div = live_match.find("div.widget-match-header__scorers-names--away");

    // Helper function to extract goals
    const extractGoals = (goalDiv) => {
      const goals = [];
      goalDiv.each((_, el) => {
        const items = $(el).find("div");
        if (items.length === 0) {
          goals.push({ goal_scorer: null, goal_time: null });
        } else {
          items.each((_, g) => {
            const goal_scorer_name = $(g).text().trim();
            const goal_time_value = goal_scorer_name.match(/\((.*?)\)/)?.[1] || null;
            goals.push({ goal_scorer: goal_scorer_name, goal_time: goal_time_value });
          });
        }
      });
      return goals;
    };

    return {
      team1_badge: team1_badge_url,
      team1_goal_status: extractGoals(team1_goal_div),
      team2_badge: team2_badge_url,
      team2_goal_status: extractGoals(team2_goal_div),
    };
  } catch (err) {
    throw new Error("Error fetching match details: " + err.message);
  }
};

// ✅ Get Match Summary
const getSummary = async (match_details_link) => {
  try {
    const { data: html } = await axios.get(`https://www.goal.com/${match_details_link}`);
    const $ = cheerio.load(html);

    const table = $("table");
    const team1_goal_scorer = table.find("tbody tr:nth-child(2) div.widget-match-header__scorers-names--home");
    const team2_goal_scorer = table.find("tbody tr:nth-child(2) div.widget-match-header__scorers-names--away");

    if (!team1_goal_scorer.html() && !team2_goal_scorer.html()) {
      return [{ goal_scorer: null, goal_time: null }];
    }

    // Expand parsing later if needed
    return [{ goal_scorer: "Data available", goal_time: null }];
  } catch (err) {
    throw new Error("Error fetching summary: " + err.message);
  }
};

// ✅ EXPORTS (CommonJS)
module.exports = { getLeagueUrl, getMatchDetails, getSummary };
