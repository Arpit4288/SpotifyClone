export const ACCESS_TOKEN = "ACCESS_TOKEN";
export const TOKEN_TYPE = "TOKEN_TYPE";
export const EXPIRES_IN = "EXPIRES_IN";
export const LOADED_TRACKS = "LOADED_TRACKS";
const APP_URL = import.meta.env.VITE_APP_URL;

// we want to create an end point for userinfo
export const ENDPOINT = {
    userInfo:"me",
    // we specified the limit of playlist only 5 we can get more than it
    featuredPlaylist: "browse/featured-playlists?limit=5",

    // we want only 10 items of the perticular playlist
    topLists: "browse/categories/toplists/playlists?limit=10",

    // the endpoint for playlist for -->  /playlists/{playlist_id} for we going to pass the id withing the dashboard.js for particular playlist
    playlist:"playlists",
    /* This is the endpoint for users playlist for fetching the users playlist dynamically */
    userPlaylists:"me/playlists"
}

export const logout = ()=>{
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(EXPIRES_IN);
    localStorage.removeItem(TOKEN_TYPE);
    window.location.href = APP_URL;
    // we have to go to the localhost/300 port and start as new user have to login agin
    // and we need to export this function
}


export const setItemInLocalStorage = (key, value)=>{
    // localStorage.setItem("arpit", "dhuriya");
    localStorage.setItem(key, JSON.stringify(value)
)};
export const getItemFromLocalStorage = (key)=> JSON.parse(localStorage.getItem(key));

 export const SECTIONTYPE = {
    DASHBOARD : "DASHBOARD",
    PLAYLIST : "PLAYLIST"
}