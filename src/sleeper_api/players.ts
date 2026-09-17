/**
 * @fileoverview fetch and save player data from sleeper API
 * FROM DOCS: Please use this call sparingly, as it is intended only
 * to be used once per day at most to keep your player IDs updated.
 * The average size of this query is 5MB
 */

import fs from 'fs';
import { cwd } from 'process';

export type Player = {
    hashtag: string,
    depth_chart_position: number,
    status: string,
    sport: string,
    fantasy_positions: string[],
    number: number,
    search_last_name: string,
    injury_start_date: string | null,
    weight: string,
    position: string,
    practice_participation: string | null,
    team: string | null,
    last_name: string,
    college: string,
    injury_status: string | null,
    player_id: string,
    height: string,
    search_full_name: string,
    age: number,
    birth_country: string,
    search_rank: number,
    first_name: string,
    depth_chart_order: number,
    years_exp: number,
    search_first_name: string,
}
export type PlayerData = {
    [player_id: string]: Player
}

const fetchPlayers = async () => {
    const response = await fetch(`https://api.sleeper.app/v1/players/nfl`);
    const data: PlayerData = await response.json();
    return data;
};

const savePlayers = (data: PlayerData) => {
    fs.writeFileSync(`${cwd()}/data/players.json`, JSON.stringify(data, null, 4));
};

const readPlayers = () => {
    const path = `${cwd()}/data/players.json`;
    const exists = fs.existsSync(path);
    if (!exists) {
        return null;
    }
    const dataStr = fs.readFileSync(path).toString();
    const data: PlayerData = JSON.parse(dataStr);
    return data;
};

export const getPlayers = async (fetch_new?: boolean) => {
    const existingData = readPlayers();
    if (existingData && !fetch_new) {
        console.log('\tReturning Existing Data');
        return existingData;
    }

    console.log('\tFetching New Player Data...');
    const newData = await fetchPlayers();
    savePlayers(newData);
    return newData;
};