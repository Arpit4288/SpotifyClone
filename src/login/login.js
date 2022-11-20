import { ACCESS_TOKEN, EXPIRES_IN, TOKEN_TYPE } from "../common";

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;  // use meta to import data from env file
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const APP_URL = import.meta.env.VITE_APP_URL;
// console.log("Client id : " + CLIENT_ID);
// console.log("Redirect url : " + REDIRECT_URI);
// console.log("App url : " + APP_URL);
const scopes = "user-top-read user-follow-read playlist-read-private user-library-read";
const authorizeUser = ()=>{
    const url = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=${scopes}&show_dialog=true`;
    window.open(url, "login", "width = 800, height = 600");
    
}
document.addEventListener("DOMContentLoaded", () =>{
    const loginButton = document.getElementById("login-to-spotify");
    loginButton.addEventListener("click", authorizeUser)
})

window.setItemsInLocalStorage = ({accessToken, tokenType, expires_in})=>{
    localStorage.setItem(ACCESS_TOKEN, accessToken);
    localStorage.setItem(TOKEN_TYPE, tokenType);
    // when we get the expire time this values in second and we need to monitor the time because by default the expire time is 3600sec means 1 hour after that we need to re login
    // for monitoring we need to convert the expire time into mili seconds from seconds because date.now gives the time in mili seconds
    // Actually when we loged in it stores the access token, and token type and we also be storing the (expireint*100)ms + currtime means the time when token will expire
    localStorage.setItem(EXPIRES_IN, (Date.now() + (expires_in*1000)));;
    // window.location.href = `${APP_URL}/dashboard/dashboard.html`;
    window.location.href = APP_URL;
}

window.addEventListener("load", () =>{
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    if(accessToken){
        window.location.href = `${APP_URL}/dashboard/dashboard.html`;
    }
    if(window.opener != null && !window.opener?.closed){
        // this piece of code identifies wheather they are inside the pop-up or not
        window.focus();
        //login page is closed by the user or any of this thing is happen
        if(window.location.href.includes("error")){
            window.close();
        }

        const {hash} = window.location;
        const searchParams = new URLSearchParams(hash);
        const accessToken = searchParams.get("#access_token");

        // '#access_token=BQA5xv48NFRxTQadJ00q5bxehncCcfh0x3f5PacpptUGeHVR6-xfWJ90IweHLw2BBXHl12Mt0FQlzxv4rxJi0-WFWEniSa3qMDEuEBSMEbROsva_c9ZW6foNz64K3lqNvcnBJwgViQXToUIKpGkcjVgc6Zbi_R7hiWJocU6qBt-1Xp0cSNVM6_1cvOws_zn694EfTewFo2Unwll-KnVtZRxY1n5wv2_s7Q&token_type=Bearer&expires_in=3600'

        const tokenType = searchParams.get("token_type");
        const expires_in = searchParams.get("expires_in");
        if(accessToken){
            window.close();
            // we want to go back to opener of this popup
            window.opener.setItemsInLocalStorage({accessToken, tokenType, expires_in});
        }
        else{
            window.close();
        }
    }
})