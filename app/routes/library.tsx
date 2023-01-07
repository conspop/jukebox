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

  const albums = await getAlbums(session.user?.id as string);

  if (albums) {
    return json(albums);
  }

  return json(
    [] as {
      albumId: string;
      artist: string;
      album: string;
      imageUrl: string;
    }[]
  );
}

export default function Library() {
  const albums = useLoaderData<typeof loader>();

  return (
    <div className="max-w-5xl mx-auto">
      <ul className="grid grid-cols-3 gap-4 justify-center">
        {albums.map((album) => (
          <li key={album.albumId}>
            <div className="w-full h-full">
              <img className="block" src={album.imageUrl} alt={album.album} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
