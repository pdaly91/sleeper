export namespace TypeSleeperPlayer {
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
}