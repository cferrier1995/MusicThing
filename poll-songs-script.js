function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function poll_songs() {
    while (true) {
		let song_name = document.getElementsByClassName('title style-scope ytmusic-player-bar')[0].getRawText();
        fetch('http://localhost:3000/current_song', {
			method: 'POST',
			body: JSON.stringify({
				song_name: song_name
			}),
			headers: {
				'Content-type': 'application/json; charset=UTF-8'
			}
		})
		.catch(err => { console.log(err) });
		await sleep(1000);
	}
}

poll_songs();
