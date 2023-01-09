import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
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
  const albumUri = formData.get("albumUri") as string;
  const artist = formData.get("artist") as string;
  const album = formData.get("album") as string;
  const imageUrl = formData.get("imageUrl") as string;

  await addAlbum(
    session.user?.id as string,
    albumId,
    albumUri,
    artist,
    album,
    imageUrl
  );

  return null;
}

export default function AddAlbum() {
  const { albums, queryString } = useLoaderData<typeof loader>();

  const [query, setQuery] = useState(queryString);
  const addAlbum = useFetcher();

  return (
    <div className="max-w-5xl mx-auto flex flex-col">
      <div className="grid grid-cols-3">
        <div className="flex justify-start items-center p-8 pb-14">
          <Link to="/library">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 stroke-slate-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
              />
            </svg>
          </Link>
        </div>
        <div className="grow flex justify-center gap-4 p-8 pb-14">
          <div className="flex gap-2 items-center ">
            <input
              type="text"
              className="p-4 text-slate-300 rounded-full border border-slate-300 bg-slate-600 text-center"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              ref={(input) => input?.focus()}
            />
          </div>
          <Link
            to={`/add?query=${query}`}
            className="p-2 flex justify-center items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 stroke-slate-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </Link>
        </div>
      </div>
      {albums && (
        <ul className="grid grid-cols-4 gap-4 justify-center">
          {albums.map((album) => (
            <li
              key={album.id}
              className={
                "relative" +
                (album.added ? " cursor-default" : " cursor-pointer")
              }
              onClick={() => {
                const data = new FormData();
                data.append("albumId", album.id);
                data.append("albumUri", album.uri);
                data.append("artist", album.name);
                data.append("album", album.artists[0].name);
                data.append("imageUrl", album.images[0].url);

                addAlbum.submit(data, {
                  method: "post",
                  action: `/add?query=${queryString}`,
                });
              }}
            >
              <button
                type="button"
                className={
                  "w-full h-full" +
                  (album.added ? " opacity-100" : " opacity-25")
                }
                disabled={
                  addAlbum.submission?.formData.get("albumId") === album.id ||
                  album.added
                }
              >
                <img
                  className="block"
                  src={album.images[0].url}
                  alt={album.name}
                />
              </button>
              {!album.added && (
                <div
                  className={
                    "w-full h-full absolute flex justify-center items-center top-0 left-0" +
                    (addAlbum.submission?.formData.get("albumId") === album.id
                      ? " animate-spin"
                      : "")
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-1/5 h-1/5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
