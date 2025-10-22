# Word Search

My sister asked me to create her a quick and easy word search app. I threw together a react app and decided to use hooks to get more practice with them. This was done mostly fast so I could get it to her. If she finds it useful and requests more features, I'll update it with a better UI and make it a more serious project.

## Placement modes

- **Classic** – Generates a traditional word search with straight-line words using a configurable set of directions.
- **Boggle-style** – Generates freeform paths that snake through adjacent cells (including diagonals) without reusing a cell within the same word. Toggle this mode from the new placement dropdown in the form.

When a puzzle cannot place every requested word, a warning banner shows how many words were successfully included.
