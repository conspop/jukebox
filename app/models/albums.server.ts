import { supabase } from "supabase/supabase";
import type { Item } from "~/types/spotifyAlbum";

export async function getAlbums(userId: string): Promise<
  | {
      albumId: string;
      albumUri: string;
      artist: string;
      album: string;
      imageUrl: string;
    }[]
  | null
> {
  const { data, error } = await supabase
    .from("albums")
    .select()
    .eq("userId", userId)
    .order("album", { ascending: true });

  if (error) {
    console.log(error);
    return null;
  }

  return data;
}

export async function addAlbum(
  userId: string,
  albumId: string,
  albumUri: string,
  artist: string,
  album: string,
  imageUrl: string
) {
  const { data, error } = await supabase
    .from("albums")
    .insert({
      userId,
      albumId,
      albumUri,
      album,
      artist,
      imageUrl,
    })
    .select();

  if (error) {
    console.log(error);
    return null;
  }

  return data[0];
}
