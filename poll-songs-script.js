// This is the script that will be run in the youtube music web app to call the current_song endpoint.
// It is not used on the server.

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function poll_songs() {
  while (true) {
    let song_name = document.title.slice(0, -10);
    fetch("https://music-thing-391d71bfd4ec.herokuapp.com/current_song", {
      method: "POST",
      body: JSON.stringify({
        song_name: song_name,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    }).catch((err) => {
      console.log(err);
    });
    await sleep(1000);
  }
}

poll_songs();
