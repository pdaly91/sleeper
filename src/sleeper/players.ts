/**
 * @fileoverview fetch and save player data from sleeper API
 * FROM DOCS: Please use this call sparingly, as it is intended only
 * to be used once per day at most to keep your player IDs updated.
 * The average size of this query is 5MB
 */

import fs from 'fs';
import { cwd } from 'process';
import { TypeSleeperPlayer } from '../types/sleeper/player';

const fetchPlayers = async () => {
    const response = await fetch(`https://api.sleeper.app/v1/players/nfl`);
    const data: TypeSleeperPlayer.PlayerData = await response.json();
    return data;
};

const savePlayers = (data: TypeSleeperPlayer.PlayerData) => {
    fs.writeFileSync(`${cwd()}/data/players.json`, JSON.stringify(data, null, 4));
};

const readPlayers = () => {
    const path = `${cwd()}/data/players.json`;
    const exists = fs.existsSync(path);
    if (!exists) {
        return null;
    }
    const dataStr = fs.readFileSync(path).toString();
    const data: TypeSleeperPlayer.PlayerData = JSON.parse(dataStr);
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