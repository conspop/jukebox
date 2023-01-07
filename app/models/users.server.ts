import { supabase } from "../../supabase/supabase";

export async function getUser(spotifyId: string) {
  const { data, error } = await supabase
    .from("users")
    .select()
    .eq("spotify_id", spotifyId);
  if (error) {
    return null;
  }
  return data;
}

export async function createUser(spotifyId: string) {
  const { data, error } = await supabase.from("users").insert({
    spotify_id: spotifyId,
  });
  if (error) {
    console.log(error);
    return null;
  }
  return data;
}
