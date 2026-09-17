/**
 * @fileoverview fetch user from sleeper API
 */

type UserData = {
    username: string,
    user_id: string,
    display_name: string,
    avatar: string;
}

export const fetchUser = async (userId: string) => {
    const response = await fetch(`https://api.sleeper.app/v1/user/${userId}`);
    const data: UserData = await response.json();
    return data;
};