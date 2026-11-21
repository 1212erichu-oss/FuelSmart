# FuelSmart notes

## How to run it

```text
node server.js
```

Then open http://localhost:3000 in a browser.

## How to put it online with Vercel

- Vercel serves the page from `public/` and runs `api/check.js` as the server-side `/api/check` function.
- In Vercel Project Settings → Environment Variables, add `KEYGEN_URL` and `KEYGEN_TOKEN` for the environments you use.
- No other Vercel setting is needed for this project. Keep `.env` local and never upload it.
- Browser saving still uses localStorage, so each browser keeps its own data.

## What is done

- Saved the project brief in BRIEF.md.
- Built a local web app for today’s lunch options, preferences, and budget.
- Added a local server so the OpenAI key stays on the server and is never sent to the web page.
- The server gets the AI key through getKey() in getKey.js, which asks MindDo for a temporary key and caches it until expiresAt.
- MindDo settings are placed in .env as KEYGEN_URL and KEYGEN_TOKEN; .env is ignored by Git.
- Added the AI meal-pick request with a Thinking state and a safe fallback message.
- Added energy explanations and a plate food-group checker.
- Added browser-only saving with sample lunch items.
- Saves on this computer only for now.
- OpenAI model found through MindDo: `gpt-5.6-luna`.

## MVP checks

1. Lunch pick: enter lunch options, preferences, and budget, then press Check.
2. Energy reasons: read the short reason beside each selected food.
3. Plate builder: add foods and check for protein, grain, fruit, vegetable, and dairy.
4. Safe answers: try a normal lunch question and a harmful dieting question.

## MVP status

- Lunch pick: works fully. Tested locally on November 20, 2026 with “pizza, apple, milk”; the AI returned a balanced chart and energy reasons.
- Energy reasons: works. Read the “Why it helps” chart and the short reasons under it.
- Plate builder: works. Tap sample foods, see the food groups, reload the page, and confirm the plate remains.
- Safe answers: works as a safety rule in the server prompt and friendly fallback; still needs more student testing before competition submission.

## Maybe Later

- The user can log what they ate today and get a simple balance check.
- The user can ask the AI for healthy snack ideas to bring from home.
- The user can list foods they are allergic to so the AI avoids them.
- The user can see a reminder to check diet changes with a doctor.
- The user can plan a week of lunches with the AI.
- The user can swap an unhealthy food for a healthier choice the AI suggests.
- The user can track how many glasses of water they drink.
- The user can report AI food advice that seems wrong.
