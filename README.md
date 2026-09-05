[![CI](https://github.com/tejasnayak25/smart-scheduler/actions/workflows/ci.yml/badge.svg)](https://github.com/tejasnayak25/smart-scheduler/actions)

## Planora

AI-assisted daily planning app with:

- task form + priority/deadline
- schedule generation with chunking/breaks/overflow handling
- Gemini quick-add from natural language
- local persistence via Zustand + localStorage

## Setup

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```bash
GEMINI_API_KEY=your_api_key_here
# optional
GEMINI_MODEL=gemini-3.1-flash-lite-preview
```

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing

Run tests once:

```bash
npm run test
```

Run in watch mode:

```bash
npm run test:watch
```

Current tests include:

- scheduler logic (`src/utils/scheduler.test.js`)
- Gemini output normalization (`src/app/api/gemini/route.test.js`)

## AI Quick Add

Use the "Quick Add with Gemini" field to type natural language such as:

- "study math for 2 hours and finish assignment"
- "gym 45 min, review notes 30 min, prep slides 60 min"

The app parses suggestions, lets you review/edit, and then add all.

## Build & Start

```bash
npm run build
npm run start
```
