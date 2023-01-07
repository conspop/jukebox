import { ActionArgs, json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { spotifyStrategy } from "~/services/auth.server";
import { findAlbum } from "~/services/spotify.server";

export async function action({ request }: ActionArgs) {
  const session = await spotifyStrategy.getSession(request);
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return { redirect: "/auth/spotify" };
  }

  const formData = await request.formData();
  const name = formData.get("name") as string;

  if (!name) {
    return { redirect: "/add" };
  }

  const options = await findAlbum(accessToken, name);

  return json(options);
}

export default function AddAlbum() {
  const options = useActionData<typeof action>();
  return (
    <div>
      {JSON.stringify(options)}
      <Form method="post">
        <label>
          Album Name
          <input type="text" name="name" />
        </label>
        <button>Find Album</button>
      </Form>
    </div>
  );
}
