/**
 * @fileoverview main file for managing api calls
 */

import fs from 'fs';
import { cwd } from 'process';
import { fetchLeageUsers, fetchLeague, fetchLeagueRosters } from "./src/league";
import { getPlayers, PlayerData } from "./src/players";

const USER_ID = '1129305024850493440';
const LEAGUE_ID = '1389708312630558720';

const hasValidPosition = (fantasy_positions: string[]) => {
    const validPositions = ['WR', 'K', 'RB', 'QB', 'TE', 'DEF'];
    return fantasy_positions.some((pos) => validPositions.includes(pos));
};

const getAvailablePlayers = (players: PlayerData, takenPlayers: Record<string, boolean>) => {
    const POSITION_CAPS: Record<string, number> = {
        QB: 18,
        RB: 35,
        WR: 35,
        TE: 18,
        K: 12,
        DEF: 20,
    };
    const counts: Record<string, number> = {
        QB: 0,
        RB: 0,
        WR: 0,
        TE: 0,
        K: 0,
        DEF: 0,
    };

    const availableMap: Record<string, boolean> = {};
    const eligible = Object.values(players).filter((player) => {
        if (player.position === 'DEF') { return !takenPlayers[player.player_id]; }
        const result = player.status === 'Active' &&
            player.position &&
            player.fantasy_positions &&
            player.team &&
            !takenPlayers[player.player_id] &&
            hasValidPosition(player.fantasy_positions) &&
            player.search_rank !== undefined &&
            player.search_rank !== null;
        return result;
    }).sort((a, b) => a.search_rank - b.search_rank);

    for (const player of eligible) {
        const { first_name, last_name, fantasy_positions } = player;
        for (const position of fantasy_positions) {
            if (typeof POSITION_CAPS[position] !== 'number') { continue; }
            if (counts[position] >= POSITION_CAPS[position]) { continue; }
            counts[position]++;
            const key = `${first_name} ${last_name} (${position})`;
            availableMap[key] = true;
            break;
        }
    }
    const available = Object.keys(availableMap);
    return available;
};

const buildRosters = async () => {
    const takenPlayers: Record<string, boolean> = {};
    type RosterResult = {
        username: string,
        teamname: string,
        user_id: string,
        players: {
            name: string,
            id: string,
            position: string,
        }[]
    }
    const result: RosterResult[] = [];
    console.log('Fetching League Users...');
    const leagueUsers = await fetchLeageUsers(LEAGUE_ID);
    console.log('Fetching League Rosters...');
    const rosters = await fetchLeagueRosters(LEAGUE_ID);
    console.log('Fetching Players...');
    const players = await getPlayers();

    console.log('Building Roster JSON');
    for (const user of leagueUsers) {
        const { user_id, display_name, metadata: { team_name } } = user;
        const roster = rosters.find((r) => r.owner_id === user_id);
        if (!roster) {
            console.log('Error finding user:', user_id);
            continue;
        }
        const entry: RosterResult = {
            username: display_name,
            teamname: team_name,
            user_id: user_id,
            players: []
        };
        for (const player_id of roster.players) {
            const player = players[player_id];
            if (!player) {
                console.log('Error finding player:', player_id);
                break;
            }
            takenPlayers[player_id] = true;
            const { first_name, last_name, fantasy_positions } = player;
            entry.players.push({
                id: player_id,
                name: `${first_name} ${last_name}`,
                position: fantasy_positions.join(',')
            });
        }
        result.push(entry);
    }
    console.log('Saving Roster JSON...');
    fs.writeFileSync(`${cwd()}/data/league_rosters.json`, JSON.stringify(result, null, 4));

    console.log('Building list of available players...');
    const available = getAvailablePlayers(players, takenPlayers);
    console.log(`Saving ${available.length} available players...`);
    fs.writeFileSync(`${cwd()}/data/available_players.json`, JSON.stringify(available, null, 4));
};

const main = async () => {
    await buildRosters();
    console.log('DONE!')
};

main();