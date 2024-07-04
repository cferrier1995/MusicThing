let express = require('express');
let fs = require('fs');
let router = express.Router();
let data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

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

function Artist(id, note) {
	this.id = id;
	this.note = note;
}

function Album(id, note, is_loved = false) {
	this.id = id;
	this.note = note;
	this.is_loved = is_loved;
}

// Intialize our list of songs, with artist and album mappings.
let songs = new Map();
let artists = data.artists;
// Not sure why for...in isn't working here. Do this instead.
for (let i = 0; i < artists.length; i++) {
	let artist = artists[i];
	let ar = new Artist(artist.id, artist.note);
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

async function GetArtist(id) {
  const url = "http://musicbrainz.org/ws/2/artist/" + id;
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

async function GetAlbum(id) {
  const url = "http://musicbrainz.org/ws/2/release/" + id;
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

async function GetSong(id) {
  const url = "http://musicbrainz.org/ws/2/recording/" + id;
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

async function GetCoverArt(id) {
  const url = "http://coverartarchive.org/release/" + id;
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
  // Doing this all in an async call w/ awaits is definitely not optimal, but I can't be arsed.
  // We'll cache these anyways.
  let song_entry = songs.get(current_song);
  let artist = await GetArtist(song_entry.artist.id);
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
  console.log(cover_art_url);
  res.render('index', {artist: artist.name, artist_note: song_entry.artist.note, album_note: song_entry.album.note, song: song.title, song_note: song_entry.note, cover_art_url:cover_art_url});
})()
});


router.post('/current_song', function(req, res, next) {
  current_song = req.body.song_name;
  res.send("set song to " + current_song);
});

module.exports = router;