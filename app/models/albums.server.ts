import { supabase } from "supabase/supabase";

export async function getAlbums(userId: string) {
  const { data, error } = await supabase
    .from("albums")
    .select()
    .eq("userId", userId);

  if (error) {
    console.log(error);
    return null;
  }

  return data;
}

export async function addAlbum(
  userId: string,
  albumId: string,
  artist: string,
  album: string,
  imageUrl: string
) {
  const { data, error } = await supabase
    .from("albums")
    .insert({
      userId,
      albumId,
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
