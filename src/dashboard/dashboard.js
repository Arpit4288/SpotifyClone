import { doc } from "prettier";
import { fetchRequest } from "../api";
import { ENDPOINT, logout } from "../common";


// This function is called when the profile button is clicked and when it clicked we want to show the logout option which is by default is hidden in html page
const onProfileClick = (event) =>{
    // --------
    // actually when we click on the button it open the navigation bar but at the same time DomEvent is happen of click and it colaps 😂 that so we need to prevent from bubbling up--->
    event.stopPropagation();


    const profileMenu = document.querySelector("#profile-menu");
    // we want to toggle the hidden class on this when we click on this once it should open that and when it again click then it should hide
    profileMenu.classList.toggle("hidden");
    // it hide the logout when it there and add logout when it not there it is toggling

    // Other functionality which we want to add when we click outside the navigation bar of button when it open it have to colaps everthing


    // After toggling we have to check wheather it have or not if it have then we have to listen the logout event if user want to logout
    if(!profileMenu.classList.contains("hidden")){
        // means if it doesn't contain the hidden class that means menu is opened already in that case we want to get the li for logout and add clickevent handler on it for logout if user want
        profileMenu.querySelector("li#logout").addEventListener("click", logout)
    }
}


const loadUserProfile = async () =>{
    const defaultImage = document.querySelector("#default-image");
    const profileButton = document.querySelector("#user-profile-btn");
    const displayNameElement = document.querySelector("#display-name");
    
    const {display_name:displayName, images} = await fetchRequest(ENDPOINT.userInfo);
    // console.log(userInfo);
    // we need to add the display name to the right corner of dashboard on the button
    displayNameElement.textContent = displayName;

    // We need to deal with the image also of the users profile which we are getting from the fetchRequest
    if(images?.length){
        // if images have some length menas users have image so we have to hide the default dummy icon svg image of tailwind (hidden is a tailwind class)
        defaultImage.classList.add("hidden");
    }else{
        // if there is no images we need to remove the hidden class
        defaultImage.classList.remove("hidden")
    }

    // we need to add an event listner on the button on name of user
    profileButton.addEventListener("click", onProfileClick)
}


const onPlaylistItemClicked = (event)=>{
    console.log(event.target);
}



// loading the featured playlist
const loadFeaturedPlaylist = async ()=>{
    const {playlists:{items}} = await fetchRequest(ENDPOINT.featuredPlaylist);
    const playlistItemsSection = document.querySelector("#featured-playlist-items");
    // let playlistItems = ``;
    for(let {name, description, images, id} of items){
        const playlistItem = document.createElement("section");
        playlistItem.className = "rounded border-solid border-2 p-4";
        playlistItem.id = id;
        playlistItem.setAttribute("data-type", "playlist");
        playlistItem.addEventListener("click", onPlaylistItemClicked)

        // withing the playlist we are interest in the items and in a perticular item we are interested in a name image descriptions
        const [{url:imageUrl}] = images;
        playlistItem.innerHTML = `<img src="${imageUrl}" alt="${name}"/ class = "rounded mb-2 object-contain shadow">
        <h2 class="text-sm">${name}</h2>
        <h3 class="text-xs">${description}</h3>`
        playlistItemsSection.appendChild(playlistItem);
    }
    // playlistItemsSection.innerHTML = playlistItems;

}


document.addEventListener("DOMContentLoaded", ()=>{
    // firstly load the uers profile
    loadUserProfile();

    // then we want that load the featured playlist
    loadFeaturedPlaylist();


    // Other functionality which we want to add when we click outside the navigation bar of the profile button when it open it have to colaps everthing
    document.addEventListener("click", ()=>{
        // we need to check wheather the profile button navigation bar is open or not
        const profileMenu = document.querySelector("#profile-menu");
        if(!profileMenu.classList.contains("hidden")){
            profileMenu.classList.add("hidden");
        }
    })
})