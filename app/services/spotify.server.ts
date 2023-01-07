export async function findAlbum(accessToken: string, query: string) {
  return await fetch(
    `https://api.spotify.com/v1/search?q=${query}&type=album`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  ).then((res) => res.json());
}
