# Project directives (market-lab / EcoLogic Learn)

- **Merging:** always merge pull requests automatically once tests pass. The owner does not need to be asked before a merge.
- **Supabase SQL:** whenever a change adds or edits a `.sql` file that must be run, always give the owner the link to the Supabase SQL Editor for project "Market simulator" (https://supabase.com/dashboard/project/qdeakgxqsffomgnhczmi/sql/new) together with the file (its GitHub link and the file itself).
- Never commit student data (names, PIN sheets) or secret keys to this public repo; `learn/js/config.js` holds only the publishable key.
- **Before every commit:** run `python3 learn/tools/stamp.py`. It puts one `?v=` version on every JS/CSS file and every module import, so browsers never mix new and cached old files (that mix made the app hang on "Loading…").
