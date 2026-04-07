# Activity Hub Agent Guide

## Goal
- Build a React activity collection for iOS, iPadOS, and Safari first.
- Default target is 10 to 11 inch iPad landscape in Safari.
- Keep student UI minimal so learners do not receive unintended hints.
- Keep every activity visually and structurally consistent.
- Preserve the current UI structure unless the user explicitly asks to redesign it.

## Current UI Baseline
- The main hub uses a simple header and a dense list of low rectangular activity buttons.
- The hub header contains only:
  - mode label (`Student` or `Teacher`)
  - title (`활동 허브`)
  - a small mode switch button on the right (`교사` or `학생`)
- Do not reintroduce large decorative summary chips such as activity counts or mode badges in the hub header unless explicitly requested.
- Activity entry buttons on the hub must stay compact:
  - low rectangular shape
  - small leading icon
  - one-line title when possible
  - designed so many activities can be scanned at once
- Activity pages use:
  - one shared top bar
  - one shared activity panel
  - one section navigation row inside the activity
  - one main content flow below

## Non-Negotiables
- Use `React + TypeScript + Vite`.
- Use the shared flat palette and design tokens in `src/index.css`.
- Wrap every activity in `ActivityShell`.
- Prefer shared modules from `src/activity-kit` before creating new UI from scratch.
- New activities must register through `src/activities/registry.tsx`.
- Activity-level hub cards must stay neutral; `quiz` and `performance` classification belongs to questions, blocks, or sections inside an activity.
- Default student mode must avoid answer exposure, verbose instructions, hover-only affordances, and drag APIs that are fragile on Safari.
- Teacher mode must preserve the same layout as student mode and only add teacher tools such as answer reveal and annotation.
- Default viewport must block zoom as much as Safari allows without breaking scroll.

## Structure
- `src/app`: routing and app-level composition
- `src/activity-kit`: reusable activity modules, hooks, and teacher tools
- `src/activities`: concrete activities
- `src/index.css`: tokens, layout primitives, and global interaction rules

## Activity Contract
- Each activity must expose:
  - `id`
  - `title`
  - `shortLabel`
  - `icon`
  - `color`
  - `softColor`
  - `Component`
- Each activity component must accept `{ mode: 'student' | 'teacher' }`.
- Student and teacher flows should share the same activity body. Teacher-only behavior should be layered in through shell state or optional overlays.
- Each question, block, or section inside an activity should be classified as `quiz` or `performance` when relevant.
- `quiz` sections must support:
  - a single `정답 제출` action
  - grading all visible quiz items at once
  - a `재도전` flow
- `quiz` sections must never reveal the correct answer in student mode, even after submission.
- `performance` sections must not present student-side right/wrong scoring.

## Hub Rules
- The hub is for fast access, not explanation.
- Keep text minimal.
- Do not add descriptions, subtitles, badges, counts, or helper paragraphs inside activity buttons unless explicitly requested.
- Prefer more visible items over larger cards.
- When many activities are added, preserve the dense rectangular button list rather than switching back to large cards.

## Activity Page Rules
- Keep the current vertical order:
  - top bar
  - activity panel
  - section tabs
  - section content
  - bottom navigation actions
- Keep the top bar layout stable across activities.
- The teacher tools must stay in the top bar on the right.
- Section tabs should remain short pill buttons.
- Section type labels such as `퀴즈 활동` or `수행 활동` belong inside the activity page, not on the hub.

## Scroll Rules
- There must be only one primary vertical scroll container for normal use.
- Prefer the outer app/page scroll over nested vertical scroll regions.
- Do not introduce internal vertical scrollbars inside activity panels unless the user explicitly asks for them.
- Horizontal overflow is allowed only where truly needed, such as a wide matching board.
- Any wide board that needs horizontal scrolling must still allow normal vertical page scrolling around it.
- Do not use gesture-prevention logic that interferes with touch scrolling.

## UI Rules
- Minimize text. Prefer icons, color, spacing, and placement.
- Keep action locations stable across activities.
- Use large touch targets. Minimum interactive height is `44px` for general controls.
- Avoid hidden hover states and desktop-only interactions.
- Use flat surfaces, low-noise backgrounds, and consistent rounded corners.
- Do not use purple-first styling. Stay within the project palette unless a new token is added intentionally.
- Preserve the current restrained, classroom-friendly visual tone.

## Hint Prevention
- Do not expose the number of correct answers unless the activity requires it.
- Do not place answer labels, debug text, or scoring logic in student view.
- Avoid auto-correcting layouts that reveal structure.
- Feedback should stay short and neutral by default.

## Safari and iPad Rules
- Prefer tap, pointer, and touch-safe interactions.
- Avoid native HTML drag-and-drop for core gameplay.
- Respect `safe-area-inset` values.
- Test wide layouts first around `1024px` to `1194px`.
- Use viewport-safe height handling and do not rely on raw `100vh`.
- Tall activities must remain scrollable in Safari.
- Never trade away scrolling reliability just to block zoom more aggressively.

## When Adding a New Module
- Create the reusable part in `src/activity-kit` if it can serve more than one activity.
- Keep module APIs small and prop-driven.
- Add only lightweight comments where the intent would otherwise be unclear.
- Reuse existing tone classes and button styles before inventing new ones.
- If a new interaction pattern is likely to recur, extract it immediately instead of burying it inside one activity.

## When Adding a New Activity
- Register it in `src/activities/registry.tsx`.
- Match the current hub button format.
- Use the same page shell and section navigation pattern as existing activities unless the user asks for a different pattern.
- Decide section-by-section whether each part is `quiz` or `performance`.
- If the activity includes quiz sections, implement submit and retry behavior without revealing answers to students.
- Worksheet-style activities should omit worksheet title and identity headers such as grade, class, number, and name unless the user explicitly asks for them.

## Before Finishing Work
- Run `npm run build`.
- Run `npm run lint`.
- Confirm teacher mode still mirrors student layout.
- Confirm no new UI element leaks answers in student mode.
- Confirm the hub still feels dense and easy to scan.
- Confirm vertical scrolling works by dragging the main page area, not only the scrollbar.
