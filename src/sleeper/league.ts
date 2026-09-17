/**
 * @fileoverview fetch league from sleeper API
 */

import { TypeSleeperLeague } from "../types/sleeper/league";

export const fetchLeague = async (leagueId: string) => {
    const response = await fetch(`https://api.sleeper.app/v1/league/${leagueId}`);
    const data: TypeSleeperLeague.LeagueData = await response.json();
    return data;
};

export const fetchLeageUsers = async (leagueId: string) => {
    const response = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`);
    const data: TypeSleeperLeague.LeagueUser[] = await response.json();
    return data;
};

export const fetchLeagueRosters = async (leagueId: string) => {
    const response = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`);
    const data: TypeSleeperLeague.RosterData[] = await response.json();
    return data;
};