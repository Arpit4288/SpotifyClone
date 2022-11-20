import { doc } from "prettier";
import { fetchRequest } from "../api";
import { ENDPOINT, getItemFromLocalStorage, LOADED_TRACKS, logout, SECTIONTYPE, setItemInLocalStorage} from "../common";

// This is an HTML audio element
const audio = new Audio();

let displayName;


// This function is called when the profile button is clicked and when it clicked we want to show the logout option which is by default is hidden in html page
const onProfileClick = (event) => {
  // --------
  // actually when we click on the button it open the navigation bar but at the same time DomEvent is happen of click and it colaps 😂 that so we need to prevent from bubbling up--->
  event.stopPropagation();

  const profileMenu = document.querySelector("#profile-menu");
  // we want to toggle the hidden class on this when we click on this once it should open that and when it again click then it should hide
  profileMenu.classList.toggle("hidden");
  // it hide the logout when it there and add logout when it not there it is toggling

  // Other functionality which we want to add when we click outside the navigation bar of button when it open it have to colaps everthing

  // After toggling we have to check wheather it have or not if it have then we have to listen the logout event if user want to logout
  if (!profileMenu.classList.contains("hidden")) {
    // means if it doesn't contain the hidden class that means menu is opened already in that case we want to get the li for logout and add clickevent handler on it for logout if user want
    profileMenu.querySelector("li#logout").addEventListener("click", logout);
  }
};

const loadUserProfile = async () => {
    // This promissing kind of thing is for displaying the users names on the home page
    return new Promise(async (resolve, reject)=>{
        const defaultImage = document.querySelector("#default-image");
        const profileButton = document.querySelector("#user-profile-btn");
        // this is the element for printing the name on the button on the header on right corner side
        const displayNameElement = document.querySelector("#display-name");
      
        const { display_name: displayName, images } = await fetchRequest(
          ENDPOINT.userInfo
        );
        
        // We need to deal with the image also of the users profile which we are getting from the fetchRequest
        if (images?.length) {
            // if images have some length menas users have image so we have to hide the default dummy icon svg image of tailwind (hidden is a tailwind class)
            defaultImage.classList.add("hidden");
        } else {
            // if there is no images we need to remove the hidden class
            defaultImage.classList.remove("hidden");
        }
        
        // we need to add an event listner on the button on name of user
        profileButton.addEventListener("click", onProfileClick);

        // console.log(userInfo);
        // we need to add the display name to the right corner of dashboard on the button
        displayNameElement.textContent = displayName;
        resolve({displayName});
    })


};

const onPlaylistItemClicked = (event, id) => {
  console.log(event.target);
  const section = { type: SECTIONTYPE.PLAYLIST, playlist: id };

  // store the section type as playlist and store the playlist url into the state
  history.pushState(section, "", `playlist/${id}`); // we want to store the playlist with the id which playlist is opened
  loadSection(section);
};

// loading the pertuicular playlist by giving the element id and endpoint
const loadPlaylist = async (endpoint, elementId) => {
  const {
    playlists: { items },
  } = await fetchRequest(endpoint);
  const playlistItemsSection = document.querySelector(`#${elementId}`);
  // let playlistItems = ``;
  for (let { name, description, images, id } of items) {
    const playlistItem = document.createElement("section");
    playlistItem.className =
      "bg-black-secondary rounded p-4 hover:cursor-pointer hover:bg-light-black";
    playlistItem.id = id;
    playlistItem.setAttribute("data-type", "playlist");
    playlistItem.addEventListener("click", (event) =>
      onPlaylistItemClicked(event, id)
    );

    // withing the playlist we are interest in the items and in a perticular item we are interested in a name image descriptions
    const [{ url: imageUrl }] = images;
    playlistItem.innerHTML = `<img src="${imageUrl}" alt="${name}"/ class = "rounded mb-2 object-contain shadow">
        <h2 class="text-base font-semibold mb-4 truncate">${name}</h2>
        <h3 class="text-sm text-secondary line-clamp-2">${description}</h3>`;
    playlistItemsSection.appendChild(playlistItem);
  }
  // playlistItemsSection.innerHTML = playlistItems;
};

// This function is use to get the playlist one by one
const loadPlaylists = () => {
  // using this function to load the other playlist
  loadPlaylist(ENDPOINT.featuredPlaylist, "featured-playlist-items");
  loadPlaylist(ENDPOINT.topLists, "top-playlist-items");
};

const fillContentForDashboard = () => {
    const coverContent = document.querySelector("#cover-content");
    console.log("Yes im for filling hallo");
    coverContent.innerHTML =   `<h1 class = "text-6xl">Hello ${displayName}</h1>`;


  const pageContent = document.querySelector("#page-content");
  const playlistMap = new Map([
    ["featured", "featured-playlist-items"],
    ["top playlists", "top-playlist-items"],
  ]);
  let innerHTML = "";
  for (let [type, id] of playlistMap) {
    innerHTML += `
        <article class="p-4">
        <h1 class="mb-4 text-2xl font-bold capitalize">${type}</h1>
        <section id="${id}" class="featured-songs grid grid-cols-auto-fill-cards gap-4">
        </section>
      </article>`;
  }
  pageContent.innerHTML = innerHTML;
};

// For formatting the time into minuts and second from ms
const formateTime = (duration) => {
  // currently duration is in miliSecond we have to change it to minuts : seconds
    const min = Math.floor(duration / 60_000);
  const sec = ((duration % 6_000) / 1000).toFixed(0);
  const formattedTime = sec == 60 ? min + 1 + ":00" : min + ":" + (sec < 10 ? "0" : "") + sec;
  return formattedTime;
};

// Whenever and track is clicked
const onTrackSelection = (id, event)=>{
    document.querySelectorAll("#tracks .track").forEach(trackItem =>{
        if(trackItem.id === id){
            trackItem.classList.add("bg-gray", "selected")
        }else{
            trackItem.classList.remove("bg-gray", "selected")
        }
    })
    // And also we want to whenever we have selected the perticular track the playbutton is there and this is handled int the own style.css
}




const updateIconsForPlayMode = (id) =>{
    const playButton = document.querySelector("#play");
    playButton.querySelector("span").textContent = "pause_circle";  // this is the playing window we are changing the icon to pause
    const playButtonFromTracks = document.querySelector(`#play-track-${id}`);
    if(playButtonFromTracks){
        playButtonFromTracks.textContent = "pause";
    }
    
}

// updating the icons of play/pause on tracks
const updateIconsForPauseMode = (id) =>{
    const playButton = document.querySelector("#play");
    playButton.querySelector("span").textContent = "play_circle";  // this is the playing window we are changing the icon to pause
    const playButtonFromTracks = document.querySelector(`#play-track-${id}`);
    if(playButtonFromTracks){
        playButtonFromTracks.textContent = "play_arrow";
    }
}


// when audio meta data is loaded means when every new song is played 
const onAudioMetadataLoaded = (id)=>{
    const totalSongDuration = document.querySelector("#total-song-duration");
    totalSongDuration.textContent = `0:${audio.duration.toFixed(0)}`;
}








const togglePlay = ()=>{
    console.log("yes is inside in toggle and get called");
    if(audio.src){
        if(audio.paused){
            audio.play();
        }else{
            audio.pause();
        }
    }
}


const findCurrentTrack = ()=>{
    const audioControl = document.querySelector("#audio-control");
    const trackId = audioControl.getAttribute("data-track-id");
    if(trackId){
        const loadedTracks = getItemFromLocalStorage(LOADED_TRACKS);
        const currentTrackIndex = loadedTracks?.findIndex(trk=>trk.id === trackId);
        return {currentTrackIndex, tracks:loadedTracks};
    }
    return null;
}

const playNextTrack = ()=>{
    const {currentTrackIndex = -1, tracks = null} = findCurrentTrack()??{};
    if(currentTrackIndex > -1 && currentTrackIndex < tracks.length-1){
        playTrack(null, tracks[currentTrackIndex + 1]);
    }
}

const playPrevTrack = ()=>{
    const {currentTrackIndex = -1, tracks = null} = findCurrentTrack()??{};
    if(currentTrackIndex > 0){
        playTrack(null, tracks[currentTrackIndex - 1]);
    }
}


// When we click on the on the playbutton we have to play that particular song
// When we click on particular track we need the some info to play the songs like (image for that track, title, artist, duration)
const playTrack = (event, {image, artistNames, name, duration, previewUrl, id})=>{
    // we doing this because if we have selected particular track it remain selected with highlighted one and when we click on play button of another that played but prevous one remain slected but not played
    if(event?.stopPropagation){
        event.stopPropagation();
    }

    if(audio.src === previewUrl){
        console.log("Yes im called");
        togglePlay();

    }else{
        console.log(image, artistNames, name, duration, previewUrl, id);
    
        const nowPlayingSongImage = document.querySelector("#now-playing-image");
        const songTitle = document.querySelector("#now-playing-song");
        const artists = document.querySelector("#now-playing-artists");
        const audioControl = document.querySelector("#audio-control");
        const songInfo = document.querySelector("#song-info");
        
        audioControl.setAttribute("data-track-id", id);
        nowPlayingSongImage.src = image.url;
        songTitle.textContent = name;
        artists.textContent = artistNames;
    
        // just playing the particular audio when we have clicked on the play button
        audio.src = previewUrl;
    
        
        // When we click on another track then the event will added we don't want to multiple of these event will added we have to remove previous one
        

        
        // playing the audio when all is set
        audio.play();
        songInfo.classList.remove("invisible");
        

    }

}


// for loading the playlist tracks
const loadPlaylistTracks = ({ tracks }) => {
    console.log("Yes im for loading the whole trackes");
  const trackSection = document.querySelector("#tracks");
  let trackNo = 1;

    // for storing in the locall storage
  let loadedTracks = [];


  for (let trackItem of tracks.items.filter(item=>item.track.preview_url)) {
    let { id, artists, name, album, duration_ms: duration, preview_url:previewUrl} = trackItem.track;

    // we need to create section programativelly because we need to add click event on it
    let track = document.createElement("section");
    track.id = id;
    track.className =
      "track p-1 grid grid-cols-[50px_1fr_1fr_50px] items-center justify-items-start gap-4 rounded-md hover:bg-light-black";

    let image = album.images.find((img) => img.height === 64);

    // All of the artists which are , seperated
    let artistNames = Array.from(artists,(artist) => artist.name).join(", ");
    track.innerHTML = `
        <p class="relative w-full flex items-center justify-center justify-self-center"><span class = "track-no">${trackNo++}</span></p>
            <section class="grid grid-cols-[auto_1fr] place-items-center gap-2">
                <img class="h-10 w-10" src="${image.url}" alt="${name}" />
                <article class="flex flex-col gap-2 justify-center">
                    <h2 class=" song-title text-base text-primary line-clamp-1">${name}</h2>
                    <!-- There are many artist so we have to combine all the artists -->
                    <p class="text-xs line-clamp-1">${artistNames}</p>
                </article>
            </section>
        <p class = "text-sm">${album.name}</p>
        <p class = "text-sm">${formateTime(duration)}</p>
        `;

    // when we click on perticular track we want to play it right and also make it stick as focus on it
    track.addEventListener("click", (event)=> onTrackSelection(id, event));
    
    const playButton = document.createElement("button");
    playButton.id = `play-track-${id}`;
    playButton.className = `play w-full absolute left-0 text-lg invisible material-symbols-outlined`;
    playButton.textContent = "play_arrow";
    
    // When we click on the play button it will play that song
    playButton.addEventListener("click", (event)=>playTrack(event, {image, artistNames, name, duration, previewUrl, id}))     

    /*
    into the track we want to find the first paragraph and append the playbutton 
    which is by default invisible and whenever we hover on the perticular track 
    we want to show the playbutton and this kind of functionality not covered by the tailwind 
    so we have to define our own css for this so we have defined this in our style.css file
    */
    track.querySelector("p").appendChild(playButton);


    trackSection.appendChild(track);

    loadedTracks.push({id, artistNames, name, album, duration, previewUrl, image});  // for storing in the locall storage
  }
  setItemInLocalStorage(LOADED_TRACKS, loadedTracks);
};

//
const fillContentForPlaylist = async (playlistId) => {
  // get the tracks under playlist
  const playlist = await fetchRequest(`${ENDPOINT.playlist}/${playlistId}`);
  console.log(playlist);

  const{name, description, images, tracks, followers} = playlist;

  // followers means likes it handled later on
//   let trackItem = tracks.item;    later on


  const coverElement = document.querySelector("#cover-content");
  coverElement.innerHTML = `
            <img class = "object-contain h-36 w-36" src="${images[0].url}" alt=""/>
            <section>
                <h2 id="playlist-name" class="text-4xl">${name}</h2>
                <!-- This will added later on ::  <p id="playlist-quote" class="text-secondary text-lg">${description}</p> -->
                <p id="playlist-details" class = "text-secondary">${tracks.items.length} songs</p>
            </section>
  `;


  // we want to get rid the pagecontent
  const pageContent = document.querySelector("#page-content");
  // at start we have to firstly gives the header by default
  pageContent.innerHTML = `
    <header id = "playlist-header" class="mx-8 border-secondary border-b-[0.5px] z-10">
            <nav class = "py-2">
              <ul
                class="grid grid-cols-[50px_1fr_1fr_50px] gap-4 text-secondary"
              >
                <li class="justify-self-center">#</li>
                <li>Title</li>
                <li>Album</li>
                <li>🕘</li>
              </ul>
            </nav>
    </header>
    <section class="px-8 text-secondary mt-4" id="tracks">
    </section>
    `;

  console.log("This is the playlist loading --->");
  console.log(playlist);

  // loop through all the track which are there and this is done by the function called loadPlaylistTracks
  loadPlaylistTracks(playlist);
};

const onContentScroll = (event) => {
  // This is for the main header of home page of user profile button


  
  // we want to get the event like where the scroll is at a time (scrollType property gives us how much we have scrolled the top)
  const { scrollTop } = event.target;
  const header = document.querySelector(".header");

  // This is a upper cover element
  const coverElement = document.querySelector("#cover-content");
  // this functionality is for when we scroll top the heder becomes more darker its opacity becomes ++ and the cover content like image and all are invisible and header is darker
  const totalHeight = coverElement.offsetHeight;
  const coverOpacity = 100 - (scrollTop >= totalHeight?100:((scrollTop/totalHeight)*100));
  const headerOpacity = scrollTop >= header.offsetHeight?100: ((scrollTop/header.offsetHeight)*100);
  coverElement.style.opacity = `${coverOpacity}%`;
  header.style.background = `rgba(0 0 0 / ${headerOpacity}%)`;



//   // we can check wheather we have scrolledd as much the header height
//   if (scrollTop >= header.offsetHeight) {
//     header.classList.add("sticky", "top-0", "bg-black");
//     // we want to remove the transparent background which we have seted for header
//     header.classList.remove("bg-transparent");
//   } else {
//     // we will invert all of these which are added in if statement
//     header.classList.remove("sticky", "top-0", "bg-black");
//     // we want to remove the transparent background which we have seted for header
//     header.classList.add("bg-transparent");
//   }

  // This is for the playlist header of playlist page of user
  if (history.state.type === SECTIONTYPE.PLAYLIST) {

    // This is the playlist header element
    const playlistHeader = document.querySelector("#playlist-header");
    if (coverOpacity <= 35) {
      playlistHeader.classList.add("sticky", "bg-black-secondary", "px-8");
      playlistHeader.classList.remove("mx-8");
      playlistHeader.style.top = `${header.offsetHeight}px`;
    } else {
      playlistHeader.classList.remove("sticky", "bg-black-secondary", "px-8");
      playlistHeader.classList.add("mx-8");
      playlistHeader.style.top = `revert`;
    }
  }
};

const loadSection = (section) => {
  if (section.type === SECTIONTYPE.DASHBOARD) {
    console.log("Yes im called im for loading the dashboard completely");
    fillContentForDashboard();
    loadPlaylists();
  } else if (section.type === SECTIONTYPE.PLAYLIST) {
    // load the elements for playlist
    fillContentForPlaylist(section.playlist);
  }

  // This is a scroll event handler
  // In case it exist then we have to first remove it then add so we do avoid to call this event handler multiple time
  document
    .querySelector(".content")
    .removeEventListener("scroll", onContentScroll);
  document
    .querySelector(".content")
    .addEventListener("scroll", onContentScroll);
};


/* loading the playlist on user playlist click */
const onUserPlaylistClick = (id)=>{
    /* we have id of the particlar playlist */
    const section = {type:SECTIONTYPE.PLAYLIST, playlist:id};
    /* push this state in history we want to load into the dashboard and we want to goto to the playlist and we want it to show the id in the url*/
    history.pushState(section, "", `/dashboard/playlist/${id}`);
    loadSection(section);
}

const loadUserPlaylists = async ()=>{
    const playlists = await fetchRequest(ENDPOINT.userPlaylists);
    console.log("Users playlist: --->")
    console.log(playlists);
    const userPlaylistSection = document.querySelector("#user-playlists >ul");
    userPlaylistSection.innerHTML = "";

    /* looping through the all of the playlist which user have and add it at the navigation ba
    and also after added when user click particular playlist we have to load it */
    for(let {name, id} of playlists.items){
        const li = document.createElement("li");
        li.textContent = name;
        li.className = "cursor-pointer hover:text-primary";
        li.addEventListener("click", ()=> onUserPlaylistClick(id));
        userPlaylistSection.appendChild(li);
    }
}





document.addEventListener("DOMContentLoaded", async () => {
    // when dom is loaded these all have to created
    const volume = document.querySelector("#volume");
    const playButton = document.querySelector("#play");
    const songDurationCompleted = document.querySelector("#song-duration-completed");
    const songProgress = document.querySelector("#progress");
    const timeline = document.querySelector("#timeline");
    const audioControl = document.querySelector("#audio-control");
    const next = document.querySelector("#next");
    const prev = document.querySelector("#prev");
    let progressInterval;

  /* firstly load the uers profile and also while it is loading it loads the display name and we want to get that as return which is returned from the loadProfile function */
  ({displayName} =  await loadUserProfile());


  /* once we we have the users profile then we need to fetch the users plylist for showing the playlist in the navigation section */
  loadUserPlaylists();


  const section = {type: SECTIONTYPE.DASHBOARD};
  //   playlist = "37i9dQZF1DXcBOn0qcyd5C";
//   const section = {
//     type: SECTIONTYPE.PLAYLIST,
//     playlist: "37i9dQZF1DXcBOn0qcyd5C",
//   };

//   history.pushState(section, "", `/dashboard/playlist/${section.playlist}`);

  //   const section = { type: SECTIONTYPE.DASHBOARD };
  // Initially we will assosiate with the perticular URL we make use of history API (data initiated with the initial state is the dashboard)
  history.pushState(section, "", "");
  loadSection(section); // passing the default section as dashboard

  // filling content in the dashboard  it load the featured playlist and the top list
  // fillContentForDashboard();   // This will handled by the section by dynamically no need to call seperately

  // Other functionality which we want to add when we click outside the navigation bar of the profile button when it open it have to colaps everthing
  document.addEventListener("click", () => {
    // we need to check wheather the profile button navigation bar is open or not
    const profileMenu = document.querySelector("#profile-menu");
    if (!profileMenu.classList.contains("hidden")) {
      profileMenu.classList.add("hidden");
    }
  });

  audio.addEventListener("play", ()=>{
        const selectedTrackId = audioControl.getAttribute("data-track-id");

        const tracks = document.querySelector("#tracks");
        const playingTrack = tracks?.querySelector("section.playing");
        const selectedTrack = tracks?.querySelector(`[id ="${selectedTrackId}"]`);
        if(playingTrack?.id !== selectedTrack?.id){
            playingTrack?.classList.remove("playing");
        }
        selectedTrack?.classList.add("playing");


        // 
        progressInterval =  setInterval(() =>{
            if(audio.paused){
                return
            }
            songDurationCompleted.textContent = `${audio.currentTime.toFixed(0)<10?"0:0"+audio.currentTime.toFixed(0) : "0:"+ audio.currentTime.toFixed(0)}`;
            songProgress.style.width = `${(audio.currentTime / audio.duration)*100}%`;   // percentage completed
        }, 100);

        updateIconsForPlayMode(selectedTrackId);
  });

    audio.addEventListener("pause", ()=>{
        if(progressInterval){
            clearInterval(progressInterval);  // when new song is played we need to clear the interval
        }
        const selectedTrackId = audioControl.getAttribute("data-track-id");
        updateIconsForPauseMode(selectedTrackId);
    })

  // Once the URL has been loaded, removed the previous event and the duration has been created for the audio element this event get triggered when that happens we 
  audio.addEventListener("loadedmetadata",onAudioMetadataLoaded);
    
  playButton.addEventListener("click",togglePlay);


  // When we are clicking on the sound increase bar it should increase/decrease volume according to the value where are you clicking
  volume.addEventListener("change",()=>{
    audio.volume = volume.value /100;
  })


  timeline.addEventListener("click", (e) =>{
    const timelineWidth = window.getComputedStyle(timeline).width;
    const timeToSeek = (e.offsetX / parseInt(timelineWidth)) * audio.duration;
    audio.currentTime = timeToSeek;
    songProgress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
  }, false);  // passing false so that this happens in the captured phase itself



  next.addEventListener("click", playNextTrack);
  prev.addEventListener("click", playPrevTrack);

  // we need to listen an event for when we push back or forword button then it should load all the content of dashboard
  window.addEventListener("popstate", (event) => {
    // we want to get the state for this event.state
    // we are pushing the state into the history we when the popstate event happen it load the previous state which are in the history;
    console.log("Event state when you are push the back button ");
    console.log(event.state);
    console.log(event);
    loadSection(event.state);
  });
});
