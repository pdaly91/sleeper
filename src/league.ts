/**
 * @fileoverview fetch league from sleeper API
 */

type LeagueData = {
    total_rosters: number,
    status: string,
    sport: string,
    settings: Record<string, number>,
    season_type: string,
    season: string,
    scoring_settings: Record<string, number>,
    roster_positions: string[],
    previous_league_id: string,
    name: string,
    league_id: string,
    draft_id: string,
    avatar: string
}
type RosterData = {
    starters: string[],
    settings: {
        wins: number,
        waiver_position: number,
        waiver_budget_used: number,
        total_moves: number,
        ties: number,
        losses: number,
        fpts_decimal: number,
        fpts_against_decimal: number,
        fpts_against: number,
        fpts: number
    },
    roster_id: number,
    reserve: string[],
    players: string[],
    owner_id: string,
    league_id: string
}
type LeagueUser = {
    user_id: string,
    username: string,
    display_name: string,
    avatar: string,
    metadata: {
        team_name: string
    },
    is_owner: boolean   // is commissioner (there can be multiple commissioners)
}

export const fetchLeague = async (leagueId: string) => {
    const response = await fetch(`https://api.sleeper.app/v1/league/${leagueId}`);
    const data: LeagueData = await response.json();
    return data;
};

export const fetchLeageUsers = async (leagueId: string) => {
    const response = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`);
    const data: LeagueUser[] = await response.json();
    return data;
};

export const fetchLeagueRosters = async (leagueId: string) => {
    const response = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`);
    const data: RosterData[] = await response.json();
    return data;
};