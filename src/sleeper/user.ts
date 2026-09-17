/**
 * @fileoverview fetch user from sleeper API
 */

import { TypeSleeperUser } from "../types/sleeper/user";

export const fetchUser = async (userId: string) => {
    const response = await fetch(`https://api.sleeper.app/v1/user/${userId}`);
    const data: TypeSleeperUser.UserData = await response.json();
    return data;
};