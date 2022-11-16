import { ACCESS_TOKEN, EXPIRES_IN, logout, TOKEN_TYPE } from "./common";
const APP_URL = import.meta.env.VITE_APP_URL;
const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;




// If we take a look at token expire time it is 3600 sec means that when we loged in it expired after one hour so when that heppen we need to re login

const getAccessToken = ()=>{
    // we need to check wheather the access token is still alive means it is within the expire in duration
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    const expireIn = localStorage.getItem(EXPIRES_IN);
    const tokenType = localStorage.getItem(TOKEN_TYPE);
    if(Date.now() < expireIn){
        return {accessToken, tokenType};
    }else{
        // logout
        // otherwise we have to logout user needs to login once again
        // because logout is a commaon functionality so we have implemented it in a common.js file
        logout();
    }

}

// we need to create configration funtion which need to return for setting the headers and authorization
const createAPIConfig = ({accessToken, tokenType}, method = "GET")=>{
    return {
        headers:{
            Authorization:`${tokenType} ${accessToken}`
        },
        method
    }
}


// create funciton which call different api's depends on the end point (uerinfo / )
export const fetchRequest = async (endpoint)=>{
    // fetching the api based on the endpoint 
    const url = `${BASE_API_URL}/${endpoint}`;

    // we want to create configration
    // In order to call an spotify api we need to pass the access token as a part of header
    const result = await fetch(url, createAPIConfig(getAccessToken()));
    return result.json();
}