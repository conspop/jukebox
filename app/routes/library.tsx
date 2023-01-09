import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { getAlbums } from "~/models/albums.server";
import { spotifyStrategy } from "~/services/auth.server";
import {
  addTracksToQueue,
  getAlbumTracks,
  playAlbum,
} from "~/services/spotify.server";

export async function loader({ request }: LoaderArgs) {
  const session = await spotifyStrategy.getSession(request);
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return redirect("/auth/spotify");
  }

  const albums = await getAlbums(session.user?.id as string);

  if (albums) {
    return json(albums);
  }

  return json(
    [] as {
      albumId: string;
      albumUri: string;
      artist: string;
      album: string;
      imageUrl: string;
    }[]
  );
}

export async function action({ request }: ActionArgs) {
  const session = await spotifyStrategy.getSession(request);
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return { redirect: "/auth/spotify" };
  }

  const formData = await request.formData();

  const control = formData.get("control") as string;
  const albumId = formData.get("albumId") as string;
  const albumUri = formData.get("albumUri") as string;

  switch (control) {
    case "play":
      playAlbum(accessToken, albumUri);
      break;
    case "queue":
      const tracks = await getAlbumTracks(accessToken, albumId);
      const trackUris = tracks.map((track) => track.uri);
      addTracksToQueue(accessToken, trackUris);
      break;
    default:
      break;
  }

  return null;
}

export default function Library() {
  let albums = useLoaderData<typeof loader>();

  const [query, setQuery] = useState("");
  const addAlbumToQueue = useFetcher();

  if (query) {
    albums = albums.filter((album) => {
      return (
        album.album.toLowerCase().includes(query.toLowerCase()) ||
        album.artist.toLowerCase().includes(query.toLowerCase())
      );
    });
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col">
      <div className="grid grid-cols-3">
        <div></div>
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
        <div className="flex justify-end items-center p-8 pb-14">
          <Link to="/add">
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
                d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </Link>
        </div>
      </div>{" "}
      <ul className="grid grid-cols-4 gap-4 justify-center">
        {albums.map((album) => (
          <li className="shadow shadow-slate-600" key={album.albumId}>
            <AlbumCard addAlbumToQueue={addAlbumToQueue} album={album} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function AlbumCard({
  addAlbumToQueue,
  album,
}: {
  addAlbumToQueue: any;
  album: any;
}) {
  const [flipped, setFlipped] = useState<boolean>(false);

  const controls = useFetcher();

  if (!flipped) {
    return (
      <div className="w-full h-full" onMouseEnter={() => setFlipped(true)}>
        <img className="block" src={album.imageUrl} alt={album.album} />
      </div>
    );
  }

  return (
    <div
      className="w-full h-full relative"
      onMouseLeave={() => setFlipped(false)}
      onClick={() => {
        console.log("clicked");
        addAlbumToQueue.submit(
          { albumId: album.albumId, albumUri: album.albumUri },
          { method: "post" }
        );
      }}
    >
      <img
        className="block opacity-50"
        src={album.imageUrl}
        alt={album.album}
      />
      <div className="absolute inset-0 grid grid-rows-3 grid-cols-3 text-slate-100">
        <div className="col-span-3 flex justify-end items-start px-4">
          <button
            className="text-2xl font-bold"
            onClick={() => setFlipped(false)}
          >
            x
          </button>
        </div>
        <div className="col-span-3 flex flex-col justify-center items-center">
          <h2 className="text-lg">{album.artist}</h2>
          <h1 className="text-2xl">{album.album}</h1>
        </div>
        <div className="flex justify-center items-center">
          <button type="button" onClick={() => {}}>
            Delete
          </button>
        </div>
        <div className="flex justify-center items-center">
          <button
            type="button"
            onClick={() => {
              controls.submit(
                {
                  control: "queue",
                  albumId: album.albumId,
                  albumUri: album.albumUri,
                },
                { method: "post" }
              );
            }}
          >
            Queue
          </button>
        </div>
        <div className="flex justify-center items-center">
          <button
            type="button"
            onClick={() => {
              controls.submit(
                {
                  control: "play",
                  albumId: album.albumId,
                  albumUri: album.albumUri,
                },
                { method: "post" }
              );
            }}
          >
            Play
          </button>
        </div>
      </div>
    </div>
  );
}
