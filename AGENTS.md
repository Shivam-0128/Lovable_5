<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Data access uses the browser Cloud client with RLS (habits visible to owner or when shared; completions/comments follow habit visibility) — keeps the app simple with no server functions.
- Signed-in pages live under src/routes/_authenticated (client-only gate redirecting to /signin) and share AppShell for nav/sidebar.
