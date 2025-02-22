console.log('Let’s write JavaScript');

let currentsong = new Audio();
let songs = [];
let currFolder = "";

// Converts seconds to MM:SS format
function SecondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Fetch songs from a folder
async function getsongs(folder) {
    currFolder = folder;
    let response = await fetch(`./${folder}/`);
    let text = await response.text();
    
    let div = document.createElement("div");
    div.innerHTML = text;
    let as = div.getElementsByTagName("a");

    songs = [];
    for (let a of as) {
        if (a.href.endsWith(".mp3")) {
            songs.push(a.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songslist ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `
            <li>
                <img class="invert" src="./img/music.svg" alt="">
                <div class="info">
                    <div>${decodeURIComponent(song)}</div>
                    <div>Unknown Artist</div>
                </div>
                <div class="playnow">
                    <span>Play now</span>
                    <img class="invert" src="./img/play.svg" alt="">
                </div>
            </li>`;
    }

    document.querySelectorAll(".songslist li").forEach((e) => {
        e.addEventListener("click", () => {
            let songName = e.querySelector(".info div").textContent.trim();
            playmusic(songName);
        });
    });
    return songs;
}

// Play selected song
function playmusic(track, pause = false) {
    currentsong.src = `./${currFolder}/${track}`;
    if (!pause) {
        currentsong.play();
        document.querySelector("#play").src = "./img/pause.svg";
    }
    document.querySelector(".songinfo").textContent = decodeURIComponent(track);
    document.querySelector(".songtime").textContent = "00:00 / 00:00";
}

// Display albums
async function displayAlbums() {
    let response = await fetch(`./songs/`);
    let text = await response.text();
    
    let div = document.createElement("div");
    div.innerHTML = text;
    let anchors = div.getElementsByTagName("a");

    let cardContainer = document.querySelector(".cardcontainer");
    cardContainer.innerHTML = "";

    for (let a of anchors) {
        if (a.href.includes("/songs/")) {
            let folder = a.href.split("/").slice(-2)[0];
            let albumData = await fetch(`./songs/${folder}/info.json`).then(res => res.json());

            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <div class="circle">
                            <svg width="24" height="24" fill="black" viewBox="0 0 24 24">
                                <path d="M18.89 12.85c-.35 1.34-2.02 2.28-5.36 4.13-3.23 1.84-4.85 2.75-6.16 2.38-.54-.15-1.03-.44-1.43-.84C5 17.61 5 15.74 5 12s0-5.61.95-6.58c.4-.4.89-.69 1.43-.84 1.31-.37 2.93.54 6.16 2.38 3.34 1.85 5.01 2.79 5.36 4.13.14.55.14 1.13 0 1.69z"
                                    stroke="black" stroke-width="1.5" stroke-linejoin="round" />
                            </svg>
                        </div>
                    </div>
                    <img src="./songs/${folder}/cover.jpeg" alt="">
                    <h2>${albumData.title}</h2>
                    <p>${albumData.description}</p>
                </div>`;
        }
    }

    document.querySelectorAll(".card").forEach((e) => {
        e.addEventListener("click", async (event) => {
            songs = await getsongs(`songs/${event.currentTarget.dataset.folder}`);
            playmusic(songs[0]);
        });
    });
}

// Main function
async function main() {
    await getsongs("songs/ncs");
    playmusic(songs[0], true);
    displayAlbums();

    document.querySelector("#play").addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            document.querySelector("#play").src = "./img/pause.svg";
        } else {
            currentsong.pause();
            document.querySelector("#play").src = "./img/play.svg";
        }
    });

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").textContent =
            `${SecondsToMinutesSeconds(currentsong.currentTime)} / ${SecondsToMinutesSeconds(currentsong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    document.querySelector("#previous").addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").pop());
        if (index > 0) playmusic(songs[index - 1]);
    });

    document.querySelector("#next").addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").pop());
        if (index + 1 < songs.length) playmusic(songs[index + 1]);
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentsong.volume = e.target.value / 100;
    });

    document.querySelector(".volume img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentsong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentsong.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
    });
}

main();
