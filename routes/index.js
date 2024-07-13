let express = require('express');
let fs = require('fs');
let router = express.Router();

let current_song = "The Piper";

let headers = new Headers({
    "Accept"       : "application/json",
    "Content-Type" : "application/json",
    "User-Agent"   : "SmallJavascriptApp ferriercory@gmail.com"
});

function Song(id, artist, album, note) {
	this.id = id;
	this.artist = artist;
	this.album = album;
	this.note = note;
}

function Artist(name, note) {
	this.name = name;
	this.note = note;
}

function Album(id, note, is_loved = false) {
	this.id = id;
	this.note = note;
	this.is_loved = is_loved;
}

/* Intialize our list of songs, with artist and album mappings.
   The notes for each album/artist/song should be structured in 
   a way they can flow into eachother like sentences.
   The ids are musicbrainz api ids.
*/
let songs = new Map();
let data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
let artists = data.artists;
// Not sure why for...in isn't working here. Do this instead.
for (let i = 0; i < artists.length; i++) {
	let artist = artists[i];
	let ar = new Artist(artist.name, artist.note);
	for (let j = 0; j < artist["albums"].length; j++) {
		let album = artist.albums[j];
		let al = new Album(album.id, album.note, album.is_loved);
		console.log(album["songs"].length);
		for (let k = 0; k < album["songs"].length; k++) {
			let song = album.songs[k];
			console.log(song);
			songs.set(song.name, new Song(song.id, ar, al, song.note));
		}
	}
}

// Gets info on an album from the musicbrainz API.
async function GetAlbum(release_id) {
  const url = "http://musicbrainz.org/ws/2/release/" + release_id;
  console.log(url);
  try {
    const response = await fetch(url, {
    method  : 'GET', 
    headers : headers
	});
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error.message);
  }
}

// Gets the cover art from the cover art archive.
async function GetCoverArt(release_id) {
  const url = "http://coverartarchive.org/release/" + release_id;
  console.log(url);
  try {
    const response = await fetch(url, {
    method  : 'GET', 
    headers : headers
	});
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error.message);
  }
}

// Gets info on a song from the musicbrainz API.
async function GetSong(song_id) {
  const url = "http://musicbrainz.org/ws/2/recording/" + song_id;
  console.log(url);
  try {
    const response = await fetch(url, {
    method  : 'GET', 
    headers : headers
	});
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error.message);
  }
}


/* GET home page. */
router.get('/', function(req, res, next) {
(async() => {
  // Get data from the musicbrainz api for the correct names and such of the artist/album/ect.
  // Fetch cover art if the album response indicates we have it.
  // Doing this with async calls isn't great but I plan on caching this anyways.
  console.log(current_song);
  let song_entry = songs.get(current_song);
  let album = await GetAlbum(song_entry.album.id);
  let song = await GetSong(song_entry.id);
  let cover_art_url;
  if (album["cover-art-archive"].front) {
	  let cover_art = await GetCoverArt(song_entry.album.id);
	  for (let i = 0; i < cover_art.images.length; i++) {
		let image = cover_art.images[i];
	    if (image.front == true) {
			cover_art_url = image.image;
		}
	  }
  }
  let album_name = album.title;
  if (album_name == song_entry.artist.name) {
	  album_name = "Self-Titled";
  }
  else if (album_name == song.title) {
	  album_name = "Single";
  }
  res.render('index', {artist: song_entry.artist.name, year: album.date.substr(0,4), artist_note: song_entry.artist.note, album: album_name, album_note: song_entry.album.note, song: song.title, song_note: song_entry.note, cover_art_url:cover_art_url});
})()
});

/* POST Route to set the current song, called by polling_script.js in the browser window. */
router.post('/current_song', function(req, res, next) {
  console.log(req.body);
  current_song = req.body.song_name;
  res.send("set song to " + current_song);
});

module.exports = router;