# VYBEORA Music Academy — complete website

Latest export: 10 November 2026. Includes all 21 HTML pages, CSS, JavaScript, local images, videos and the eight new musician cutouts with 3D pop-out cards.

## Deploy through GitHub to Netlify

1. Extract the ZIP. Open the `Vybeora_Netlify` folder.
2. Sign in to GitHub and create a new repository, for example `vybeora-music-academy`.
3. Upload the CONTENTS of this folder: `dist`, `netlify.toml`, and this README. Do not upload the ZIP itself or add an extra enclosing folder. Commit the files to `main`. For many assets, GitHub Desktop is easier than browser uploads: create a local repository, copy these contents into it, commit, then Publish repository.
4. Sign in to Netlify. Choose **Add new project → Import an existing project → GitHub**.
5. Authorize access to your chosen repository, then select it.
6. Use these settings:
   - Production branch: main
   - Base directory: leave blank
   - Build command: leave blank
   - Publish directory: dist
   - Environment variables: none required
7. Choose Publish/Deploy. The included `netlify.toml` already sets the publish directory.
8. Open the generated Netlify URL. Check Home, Home 2, the card arrows, dark mode, contact page and login.
9. Future commits pushed to the connected branch trigger Netlify deployments automatically. Custom domains can be set under Domain management.

The repository root must contain `netlify.toml` and `dist/index.html`. If you see a 404 at the homepage, check this folder structure and the publish directory.

## Local preview

From this folder, run `python -m http.server 8000 --directory dist`, then open http://localhost:8000. No npm installation or build is needed.

## What this site does

This is a static frontend/demo. Login, signup, enrolment, fees and forms are demonstration interfaces; hosting does not add real authentication, payment processing or email delivery. Existing sample contact information is preserved. Connect real services and replace sample contact details before using those features operationally.

## Official deployment documentation

https://docs.netlify.com/start/quickstarts/deploy-from-repository/
https://docs.netlify.com/manage/projects/add-new-project/

## Source snapshot

Includes the latest layered coral frames, pointer-responsive depth, and eight unique musician cutouts. The original hosted website is unchanged. This export omits platform-specific hosting metadata, Git history and credentials.
