# Brightside Trivia implementation plan

## 1. Product goals

Build a focused trivia experience where a player can:

- Choose a category from the initial screen.
- Answer a sequence of four-option questions.
- Select an answer and immediately see whether it is correct.
- Skip unanswered questions, move back to earlier questions, and return home to choose another category.
- See progress and score throughout the round.
- Restart a completed category without reloading the page.
- Join from a phone using a team name and buzz into a live local round.
- Show the first team to buzz on the projection screen and lock the buzzer until reset.
- Let the host mark the response correct for one point or allow the next team to buzz.
- Maintain and display a live score for every joined team.

The first release is intentionally local and content-driven. There is no account, server-side score persistence, or question-generation service.

## 2. Content model

Each category lives in its own JSON file under `src/data/`. The UI discovers every JSON file in that directory at build time, so adding a category only requires adding the file.

Required category fields:

```json
{
  "id": "ocean",
  "displayName": "Ocean life",
  "eyebrow": "Blue planet",
  "description": "Short category description",
  "mainImage": "https://example.com/category-main.jpg",
  "pageImage": "https://example.com/category-page.jpg",
  "theme": {
    "primary": "#087f8c",
    "secondary": "#d9f1ed",
    "accent": "#f2a65a",
    "ink": "#12323a"
  },
  "questions": [
    {
      "prompt": "Question text",
      "mediaURL": "/data/resources/example.svg",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 1
    }
  ]
}
```

Content rules:

- `id` must be unique.
- Every question must have exactly four unique options.
- `correctAnswer` must be the zero-based numeric index of one option. For example, `0` means the first option and `1` means the second option.
- `mediaURL` is optional. When present, it should point to an image in `public/data/resources/` using a browser URL such as `/data/resources/example.svg`.
- Keep question ordering stable because the current UI uses array order for progress.
- `mainImage` is shown on the home category card, while `pageImage` is shown on the question screen. Local banner assets should use browser URLs such as `/data/resources/banners/friends-main.jpg` and be stored under `src/data/resources/banners/` and `public/data/resources/banners/`.

## 3. UI and state design

### Screens

1. **Category picker**
   - Loads all registered JSON categories.
   - Shows the category image, display name, short label, and question count.
   - Selecting a card starts a fresh round.

2. **Quiz screen**
   - Shows the active category's theme colors and background image.
  - Displays one question, an optional image, and four answer buttons.
   - Displays progress, score, and answered count.
   - Locks an answer after selection and shows correct/incorrect feedback.
   - Provides Back, Skip, Next, and Home controls.

3. **Completed state**
   - Uses the final question state to show a Play again action.
   - Restart resets the question index and answers while keeping the category selected.

4. **Phone buzzer**
  - The QR code opens `/?phone=1` on the phone.
  - A player joins with a team name and receives a large buzzer control.
  - Socket.IO accepts only the first tap until the projection host resets the buzzer.
  - The projection shows the winning team on both the category and question screens.
  - `Correct +1` awards the first team a point and clears the buzzer.
  - `Allow next team` clears the buzzer without awarding a point, so another team can respond.
  - Phones persist their team ID locally and automatically rejoin after screen lock, reconnect, or a brief Wi-Fi interruption.

### React state

- `category`: selected category object or `null` for the picker.
- `questionIndex`: current question position.
- `answers`: map from question index to the selected option's zero-based index.
- `buzzerState`: live team list and first tap, shared between the projection and phone clients over Socket.IO.
- Derived values calculate score, answered count, selected answer, and completion.

The app deliberately keeps state local to the root component for this first release. If the application later adds multiple routes, persistence, or multiplayer state, move the quiz state into a reducer or route-level state module.

## 4. Navigation behavior

- Home always clears the active round and returns to category selection.
- Back moves to the previous question and preserves prior answers.
- Skip advances without adding an answer. It is disabled on the final question so the player is not stranded beyond the round.
- Next requires an answer and advances one question.
- Selecting a category always resets the previous round.
- Each question starts with the buzzer closed; the host opens it after reading the question so teams cannot buzz early.

## 5. Technical setup

- React renders the client from `src/main.jsx`.
- Vite handles development and production builds.
- `src/styles.css` contains the responsive visual system and category-driven CSS variables.
- Express serves `dist/` after `npm run build` and provides an SPA fallback for future client routes.
- Express listens on `0.0.0.0:3000` for local-network access and exposes `/api/access` so the home-screen QR code always points to the host computer's LAN address.
- `npm run dev` starts the Vite development server.
- `npm run build` creates the production bundle.
- `npm start` serves the built bundle through Express on port 3000.

To use phones locally, connect every device to the same Wi-Fi network, run `npm start` on the host computer, and scan the QR code shown on the projection home screen. This does not require internet hosting.

## 6. Validation plan

Before shipping a change:

1. Run `npm run build` to validate JSON imports, JSX, and the production bundle.
2. Open the development or production app and test each category.
3. Verify selecting all answer states, skipping, going back, returning home, and restarting.
4. Check the picker and quiz screen at a narrow mobile viewport.
5. Check external image URLs and replace them with local assets if they become unreliable.

## 7. Future improvements

- Add schema validation at build time for category JSON.
- Add a dedicated results screen with percentage and missed-question review.
- Persist best scores in local storage.
- Add keyboard navigation and stronger screen-reader announcements for feedback.
- Add unit tests for quiz navigation and scoring.
- Bundle image assets locally or add an image loading fallback.
- Add a content authoring workflow so new categories do not require editing the import list manually.
