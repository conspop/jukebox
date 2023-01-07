import { Item } from "~/types/spotifyAlbum";

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
