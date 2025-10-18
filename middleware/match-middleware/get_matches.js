import dotenv from 'dotenv';
import * as cheerio from 'cheerio';
import axios from 'axios';
import csvParser from '../utils/csv-parser.js';
import jsonParser from '../utils/json-parser.js';
import fs from 'fs/promises';
import { getLeagueUrl, getMatchDetails, getSummary } from './get_functions.js';

// Load dotenv only in non-production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Function to fetch live matches
const get_live_match = async () => {
  try {
    const response = await axios.get(process.env.LIVE_SCORE_URL);
    if (response.status !== 200) throw new Error('Failed to fetch live matches');
    
    const html = response.data;
    const $ = cheerio.load(html);
    const matchesContainer = $('div.page-container div.competition-matches div.match-row-list div.match-row.match-row--status-pla').first();

    if (!matchesContainer.html()) {
      console.log('No live matches are currently playing!');
      console.log('System is exiting!');
      process.on('exit', code => console.log(`Exiting with code ${code}`));
      setTimeout(() => process.exit(), 5000);
      return;
    }

    const matches = [];
    for (const el of matchesContainer) {
      const $el = $(el);
      const date = $el.find('span.match-row__date').text();
      const time = $el.find('span.match-row__state').text();
      const score1 = $el.find('td:nth-child(1) b.match-row__goals').text();
      const team1_name = $el.find('td.match-row__team-home span.match-row__team-name').text();
      const score2 = $el.find('td:nth-child(3) b.match-row__goals').text();
      const team2_name = $el.find('td.match-row__team-away span.match-row__team-name').text();
      const match_details_link = $el.find('a.match-row__link').attr('href');
      const current_time = new Date();

      try {
        const get_details = await getMatchDetails(match_details_link);
        const match = {
          match_date: date,
          match_time: time,
          team1: team1_name,
          team1_score: score1,
          team2: team2_name,
          team2_score: score2,
          team1_badge: get_details.team1_badge,
          team2_badge: get_details.team2_badge,
          time_stamp: current_time,
          team1_goal_status: get_details.team1_goal_status[0]?.goal_scorer ?? '',
          team2_goal_status: get_details.team2_goal_status.at(-1) ?? ''
        };
        matches.push(match);
        console.log(matches);
      } catch (error) {
        console.error('Error fetching match details:', error);
      }
    }
  } catch (error) {
    console.error('Error fetching live matches:', error);
  }
};

// Function to fetch past matches
const get_past_matches = async (league_name, date) => {
  try {
    const URL = getLeagueUrl(league_name, date);
    const response = await axios.get(URL);
    if (response.status !== 200) throw new Error('Failed to fetch past matches');

    const html = response.data;
    const $ = cheerio.load(html);
    const league_name_text = $('body.layout-low-end.page-competition-matches div.page-container h1').text();
    console.log(league_name_text);

    const matchesContainer = $('div.container-competition-matches div.widget-competition-matches div.match-row.match-row--status-pld').first();
    
    if (!matchesContainer.html()) {
      console.log('No matches have been played on this date!');
      return;
    }

    for (const el of matchesContainer) {
      const $el = $(el);
      const date = $el.find('div.match-row__status span.match-row__date').text();
      const team1 = $el.find('table.match-row__teams td.match-row__team-home').text().trim();
      const score1 = $el.find('td:nth-child(1) b.match-row__goals').text().trim();
      const team2 = $el.find('table.match-row__teams td.match-row__team-away').text().trim();
      const score2 = $el.find('td:nth-child(3) b.match-row__goals').text().trim();
      const match_details_link = $el.find('a.match-row__link').attr('href');

      try {
        const get_details = await getMatchDetails(match_details_link);
        console.log(get_details);
      } catch (error) {
        console.error('Error fetching past match details:', error);
      }
    }
  } catch (error) {
    console.error('Error fetching past matches:', error);
  }
};

// Function to fetch next matches
const get_next_matches = async (league_name, date) => {
  try {
    const URL = getLeagueUrl(league_name, date);
    const response = await axios.get(URL);
    if (response.status !== 200) throw new Error('Failed to fetch next matches');

    const html = response.data;
    const $ = cheerio.load(html);
    const league_name_text = $('body.layout-low-end.page-competition-matches div.page-container h1').text();
    console.log(league_name_text);

    const matches = $('div.container-competition-matches div.widget-competition-matches div.match-row.match-row--status-fix');

    if (!matches.find('div.match-row__status span.match-row__date').text()) {
      console.log('No fixtures have been found on this date!');
      return;
    }

    for (const el of matches) {
      const $el = $(el);
      const date = $el.find('div.match-row__status span.match-row__date').text();
      const team1 = $el.find('table.match-row__teams td.match-row__team-home').text();
      const team2 = $el.find('table.match-row__teams td.match-row__team-away').text();
      console.log(`\n     ${date}\n${team1}-${team2}`);
    }
  } catch (error) {
    console.error('Error fetching next matches:', error);
  }
};

// Function to fetch match summary
const get_match_summary = async (league_name, date) => {
  try {
    const URL = getLeagueUrl(league_name, date);
    const response = await axios.get(URL);
    if (response.status !== 200) throw new Error('Failed to fetch match summary');

    const html = response.data;
    const $ = cheerio.load(html);
    const league_name_text = $('body.layout-low-end.page-competition-matches div.page-container h1').text();
    console.log(league_name_text);

    const matchesContainer = $('div.container-competition-matches div.widget-competition-matches div.match-row.match-row--status-pld');

    if (!matchesContainer.find('div.match-row__status span.match-row__date').text()) {
      console.log('No matches have been played on this date!');
      return;
    }

    const links_arr = matchesContainer
      .map((i, el) => $(el).find('a.match-row__link').attr('href'))
      .get();

    for (const [index, link] of links_arr.entries()) {
      try {
        const summary = await getSummary(link);
        const team2_details = summary.team2_goals;
        const team2_name = team2_details[0].name;
        const [first_goal, second_goal] = team2_details[1] ?? [];
        console.log(team2_name, first_goal, second_goal);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error fetching summary for match ${index + 1}:`, error);
      }
    }
  } catch (error) {
    console.error('Error fetching match summary:', error);
  }
};

export {
  get_live_match,
  get_past_matches,
  get_next_matches,
  get_match_summary
};