import { Item } from "~/types/spotifyAlbum";
import { Tracks } from "~/types/spotifyTracks";

export async function findAlbum(
  accessToken: string,
  query: string
): Promise<Item[]> {
  return await fetch(
    `https://api.spotify.com/v1/search?q=${query}&type=album`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => {
      const releases = data.albums.items as Item[];
      return releases.filter((release) => release.album_type === "album");
    });
}

export async function getAlbumTracks(
  accessToken: string,
  albumId: string
): Promise<Tracks> {
  return await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((res) => res.json())
    .then((data) => data.items as Tracks);
}

export async function addTrackToQueue(
  accessToken: string,
  trackUri: string
): Promise<void> {
  console.log(trackUri);

  fetch(`https://api.spotify.com/v1/me/player/queue?uri=${trackUri}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
}

//recursively add tracks to queue
export async function addTracksToQueue(
  accessToken: string,
  trackUris: string[]
): Promise<void> {
  if (trackUris.length === 0) {
    return;
  }
  const trackUri = trackUris.shift();

  fetch(`https://api.spotify.com/v1/me/player/queue?uri=${trackUri}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then(() => {
    addTracksToQueue(accessToken, trackUris);
  });
}

export async function playAlbum(
  accessToken: string,
  albumUri: string
): Promise<void> {
  fetch(`https://api.spotify.com/v1/me/player/play`, {
    method: "PUT",
    body: JSON.stringify({
      context_uri: albumUri,
    }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
}
