export namespace TypeFantasy {
    export type RosterResult = {
        username: string,
        teamname: string,
        user_id: string,
        players: {
            name: string,
            id: string,
            position: string,
        }[]
    }
}