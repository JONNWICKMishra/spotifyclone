console.log('Lets write java script');

let currentsong = new Audio();
let songs;
let currFolder;

function SecondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00/00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Format minutes and seconds to always have two digits
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }

    }


    let songUL = document.querySelector(".songslist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>anurag</div>
                            </div>
                            <div class="playnow">
                            <span>play now</span>
                            <img class="invert" src="img/play.svg" alt="">
                        </div></li>`;
    }
    Array.from(document.querySelector(".songslist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", elemrnt => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs
}

const playmusic = (track, pause = false) => {
    //   let audio = new Audio("/songs/" + track)
    currentsong.src = `/${currFolder}/` + track
    if (!pause) {
        currentsong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")
   let array =  Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            
        
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]

            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let response = await a.json()
            console.log(response)
            cardcontainer.innerHTML = cardcontainer.innerHTML + ` <div data-folder="${folder}"class="card">
                        <div class="play">
                            <div class="circle">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                                    fill="black">
                                    <path
                                        d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                                        stroke="black" stroke-width="1.5" stroke-linejoin="round" />
                                </svg>
                            </div>
                        </div>
                        <img src="/songs/${folder}/cover.jpeg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
                    }
                  }

                  Array.from(document.getElementsByClassName("card")).forEach(e => {
                    console.log(e)
                    e.addEventListener("click", async item => {
                        console.log("Fetching Songs")
                        songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
                        playmusic(songs[0])
                    })
                })

}

async function main() {


    // Get the list of all the songs
    await getsongs("songs/ncs")
    playmusic(songs[0], true)

    displayAlbums()




    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "img/play.svg"
        }
    })

    currentsong.addEventListener("timeupdate", () => {
        console.log(currentsong.currentTime, currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${SecondsToMinutesSeconds(currentsong.
            currentTime)}/${SecondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle-1").style.left = (currentsong.currentTime / currentsong.
            duration) * 100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle-1").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100
    })

    document.querySelector(".hamburger").addEventListener("click", e => {
        document.querySelector(".left").style.left = "0"
    })
    document.querySelector(".close").addEventListener("click", e => {
        document.querySelector(".left").style.left = "-120%"
    })

    preveous.addEventListener("click", () => {
        console.log("preveous clicked")
        console.log(currentsong)
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {
        console.log("next clicked")
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1])
        }
    })

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",
        (e) => {
            console.log(e, e.target, e.target.value)
            currentsong.volume = parseInt(e.target.value) / 100
        })

         document.querySelector(".volume>img").addEventListener("click", e=>{
            console.log(e.target)
            console.log("changing", e.target.src)
            if(e.target.src.includes("volume.svg")){
                e.target.src = e.target.src.replace("volume.svg", "mute.svg")
                currentsong.volume = 0;
                document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            }
            else{
                e.target.src = e.target.src.replace("mute.svg", "volume.svg")
                currentsong.volume = .10;
                document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
            }
         })

   
}

main()
