import './style.css';


const APP_URL = import.meta.env.VITE_APP_URL;

document.addEventListener("DOMContentLoaded", () =>{
  if(localStorage.getItem("accessToken")){
    window.location.href = `${APP_URL}dashboard/dashboard.html`;
  }
  else{
    console.log("This is called and I'am going to load the login html page but .....")
    window.location.href = `${APP_URL}/login/login.html`;
  }
})