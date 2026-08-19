# Client programmes live here, and nowhere near git

Anything matching `data/*.json` is gitignored on purpose.

A real programme contains a named account list, scores, incumbent suppliers,
commercial notes and whatever the client said in the room. None of that belongs
in a public repository, and most of it does not belong in a private one either.

## Moving work around

1. Open the app and build the programme.
2. Press **Export** in the bottom left. A JSON file downloads.
3. Keep it here, or anywhere your team already keeps client files.
4. Press **Import** to load it back, on any machine running the app.

State lives in the browser, so the hosted URL is the application and the JSON is
the data. Two people opening the same link each get their own copy until one of
them sends the other a file.

## A word on hosting

If you deploy a build with a real programme baked in rather than imported, put
Cloudflare Access in front of it first. A `.pages.dev` URL is readable by anyone
who has it, including the accounts on the list.
