import { supabase } from "../../supabase/supabase";

export async function getOrCreateUser(spotifyId: string) {
  const user = await getUser(spotifyId);
  if (user) {
    return user;
  }
  return await createUser(spotifyId);
}

export async function getUser(spotifyId: string) {
  const { data, error } = await supabase
    .from("users")
    .select()
    .eq("spotify_id", spotifyId);
  if (error) {
    return null;
  }
  return data[0];
}

export async function createUser(spotifyId: string) {
  const { data, error } = await supabase
    .from("users")
    .insert({
      spotify_id: spotifyId,
    })
    .select();
  if (error) {
    console.log(error);
    return null;
  }
  return data[0];
}
