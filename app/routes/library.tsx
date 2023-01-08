import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import {
  Link,
  Form,
  useFetcher,
  useLoaderData,
  useActionData,
} from "@remix-run/react";
import { useState } from "react";
import { addAlbum, getAlbums } from "~/models/albums.server";
import { spotifyStrategy } from "~/services/auth.server";
import {
  addTrackToQueue,
  addTracksToQueue,
  findAlbum,
  getAlbumTracks,
  playAlbum,
} from "~/services/spotify.server";
import type { Item } from "~/types/spotifyAlbum";

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
  const albums = useLoaderData<typeof loader>();

  const addAlbumToQueue = useFetcher();

  return (
    <div className="max-w-5xl mx-auto flex flex-col">
      <div className="flex justify-end items-center p-8 pb-14">
        <Link
          className="flex justify-center items-center font-bold text-4xl text-slate-100"
          to="/add"
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
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </Link>
      </div>
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
