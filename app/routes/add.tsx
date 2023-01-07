import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Link, Form, useFetcher, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { addAlbum, getAlbums } from "~/models/albums.server";
import { spotifyStrategy } from "~/services/auth.server";
import { findAlbum } from "~/services/spotify.server";
import type { Item } from "~/types/spotifyAlbum";

export async function loader({ request }: LoaderArgs) {
  const session = await spotifyStrategy.getSession(request);
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return redirect("/auth/spotify");
  }

  const query = new URL(request.url).searchParams.get("query");

  if (!query) {
    return json({ albums: [] as Item[], queryString: "" });
  }

  const queryAlbums = (await findAlbum(accessToken, query)) as Item[];
  const userAlbums = await getAlbums(session.user?.id as string);

  if (userAlbums) {
    const albums = queryAlbums.map((album) => {
      const userAlbum = userAlbums.find(
        (userAlbum) => userAlbum.albumId === album.id
      );
      return {
        ...album,
        added: userAlbum ? true : false,
      };
    });
    return json({ albums, queryString: query });
  }

  return json({ albums: queryAlbums, queryString: query });
}

export async function action({ request }: ActionArgs) {
  const session = await spotifyStrategy.getSession(request);
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return { redirect: "/auth/spotify" };
  }

  const formData = await request.formData();

  const albumId = formData.get("albumId") as string;
  const artist = formData.get("artist") as string;
  const album = formData.get("album") as string;
  const imageUrl = formData.get("imageUrl") as string;

  await addAlbum(session.user?.id as string, albumId, artist, album, imageUrl);

  return null;
}

export default function AddAlbum() {
  const { albums, queryString } = useLoaderData<typeof loader>();

  const [query, setQuery] = useState(queryString);
  const addAlbum = useFetcher();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-center gap-4 p-4">
        <div className="flex gap-2 items-center">
          <label>Query</label>
          <input
            type="text"
            className="p-2 rounded border"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Link to={`/add?query=${query}`} className="bg-blue-300 rounded p-2">
          Find Albums
        </Link>
      </div>
      {albums && (
        <ul className="flex gap-2 flex-wrap p-2 justify-center">
          {albums.map((album) => (
            <li key={album.id}>
              <button
                type="button"
                className={
                  "w-52 h-52" +
                  (album.added ? " opacity-100" : " opacity-25") +
                  (addAlbum.submission?.formData.get("albumId") === album.id
                    ? " opacity-60"
                    : "")
                }
                disabled={
                  addAlbum.submission?.formData.get("albumId") === album.id
                }
                onClick={() => {
                  const data = new FormData();
                  data.append("albumId", album.id);
                  data.append("artist", album.name);
                  data.append("album", album.artists[0].name);
                  data.append("imageUrl", album.images[0].url);

                  addAlbum.submit(data, {
                    method: "post",
                    action: `/add?query=${queryString}`,
                  });
                }}
              >
                <img src={album.images[0].url} alt={album.name} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
