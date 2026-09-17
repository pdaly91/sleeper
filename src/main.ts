/**
 * @fileoverview main file for managing api calls
 */

import fs from 'fs';
import { cwd } from 'process';
import dotenv from 'dotenv';
import { fetchLeageUsers, fetchLeague, fetchLeagueRosters } from "./sleeper/league";
import { getPlayers } from "./sleeper/players";
import { TypeSleeperLeague } from './types/sleeper/league';
import { TypeSleeperPlayer } from './types/sleeper/player';
import { TypeFantasy } from './types';

dotenv.config();

const hasValidPosition = (fantasy_positions: string[]) => {
    const validPositions = ['WR', 'K', 'RB', 'QB', 'TE', 'DEF'];
    return fantasy_positions.some((pos) => validPositions.includes(pos));
};

const getAvailablePlayers = (players: TypeSleeperPlayer.PlayerData, takenPlayers: Record<string, boolean>) => {
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

const getTeamRoster = (
    leagueData: TypeSleeperLeague.LeagueData,
    roster: TypeSleeperLeague.RosterData,
    user: TypeSleeperLeague.LeagueUser,
    playerMap: TypeSleeperPlayer.PlayerData
) => {
    const { roster_positions } = leagueData;
    const { starters, players } = roster;
    const { display_name, metadata: { team_name } } = user;

    const result: {
        user: string,
        team: string,
        starters: string[],
        bench: string[]
    } = {
        user: display_name,
        team: team_name,
        starters: [],
        bench: []
    };

    // compile starterrs
    for (let i = 0; i < starters.length; i++) {
        const position = roster_positions[i];
        const player_id = starters[i];
        const player = playerMap[player_id];
        const entry = `${position} - ${player.first_name} ${player.last_name}`;
        result.starters.push(entry);
    }

    // compile bench
    for (const player_id of players) {
        if (starters.includes(player_id)) { continue; }
        const player = playerMap[player_id];
        const position = player.fantasy_positions.join(',');
        const entry = `BENCH - ${player.first_name} ${player.last_name} (${position})`;
        result.bench.push(entry);
    }

    fs.writeFileSync(`${cwd()}/data/ROSTER_${display_name}.json`, JSON.stringify(result, null, 4));
};

const buildRosters = async () => {
    const takenPlayers: Record<string, boolean> = {};

    const LEAGUE_ID = process.env.LEAGUE_ID;
    const MY_USER_ID = process.env.PATRICK_USER_ID;
    if (!LEAGUE_ID || !MY_USER_ID) {
        throw new Error('Missing Environment Variables!');
    }

    const result: TypeFantasy.RosterResult[] = [];
    console.log('Fetching League Users...');
    const leagueUsers = await fetchLeageUsers(LEAGUE_ID);
    console.log('Fetching League Rosters...');
    const rosters = await fetchLeagueRosters(LEAGUE_ID);
    console.log('Fetching Leage Data...');
    const leagueData = await fetchLeague(LEAGUE_ID);
    console.log('Fetching Players...');
    const playerMap = await getPlayers();

    console.log('Building Roster JSON');
    for (const user of leagueUsers) {
        const { user_id, display_name, metadata: { team_name } } = user;
        const roster = rosters.find((r) => r.owner_id === user_id);
        if (!roster) {
            console.log('Error finding user:', user_id);
            continue;
        }

        if (roster.owner_id === MY_USER_ID) {
            getTeamRoster(leagueData, roster, user, playerMap);
        }

        const entry: TypeFantasy.RosterResult = {
            username: display_name,
            teamname: team_name,
            user_id: user_id,
            players: []
        };
        for (const player_id of roster.players) {
            const player = playerMap[player_id];
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
    const available = getAvailablePlayers(playerMap, takenPlayers);
    console.log(`Saving ${available.length} available players...`);
    fs.writeFileSync(`${cwd()}/data/available_players.json`, JSON.stringify(available, null, 4));
};

const main = async () => {
    await buildRosters();
    console.log('DONE!')
};

main();