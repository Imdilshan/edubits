# Edubits v2.0 — Build Phases

Window: 15 days from 2026-10-20 (ends 2026-11-04). Hard requirement: the Resources section is fully complete inside it, before end-term exams. Phases are ordered by technical dependency. Day ranges are **(default)** estimates.

**Branching:** all work stays on a branch (`v2`, name is a default) and ships to production only when ready.

## Overview

| # | Phase | Days | Depends on |
|---|-------|------|------------|
| 0 | Setup and viewer spike | 1–2 | — |
| 1 | Resources backend and Cloudinary migration | 1–4 | 0 |
| 2 | Admin dashboard | 4–6 | 1 |
| 3 | Resources frontend | 6–10 | 1, 2 |
| 4 | QuizEngine | 10–12 | 2 |
| 5 | Sign-in providers and homepage | 12–13 | 3, 4 |
| 6 | SGPA/CGPA and Internal Marks | 13–14 | — |
| 7 | Task Tracker | 14–15 | — |

Phases 4–7 are best effort inside the window. The Task Tracker is the first to slip; it is not mandatory.

## Phase 0 — Setup and viewer spike

- Create the branch.
- In the Cloudinary console, enable "Allow delivery of PDF and ZIP files" in Security settings. Free accounts block PDF delivery by default, which is worth ruling out first given the earlier viewer attempts.
- Confirm dependency approvals (see `rules.md`).
- **Spike:** render one Cloudinary-hosted PDF with `react-pdf` from a Vercel origin.
- **Decision gate (end of Day 2):** if the spike fails, stop and reassess hosting before building anything on top of it.

**Done when**
- [ ] One PDF renders in the in-site viewer from the deployed origin.
- [ ] Approvals for new packages are settled.

## Phase 1 — Resources backend and Cloudinary migration

- `Resource` model: playlist type, shared paper key with cross-link between a paper's two PDFs, variant marker, controlled year and subject values.
- Endpoints to list by year and subject, and to upload a paper pair.
- Move the existing Drive PDFs into Cloudinary and create their records; replace the hardcoded `PAPER_SOURCES`.
- Wire `/api/pyq-progress` for use by the frontend.
- Touched routes adopt the standard response shape and central error handling.

**Done when**
- [ ] Papers, playlists and notes are served from MongoDB and Cloudinary only.
- [ ] No Google Drive link remains in the Resources flow.
- [ ] Each paper's two PDFs link to each other.

## Phase 2 — Admin dashboard

- Dashboard UI for uploading PYQ and solution PDFs, notes, playlists and per-subject question JSON.
- Backend admin enforcement on every action; frontend guard added for the route.

**Done when**
- [ ] An admin can add a paper pair, a note and a playlist without touching code.
- [ ] A non-admin is rejected by the backend.

## Phase 3 — Resources frontend (milestone: Resources complete)

- `/resources` → `/resources/:year` → `/resources/:year/:subject` with PYQs, Playlists and Notes tabs.
- Two PDF cards per paper (questions only; questions + solution) opening in the `react-pdf` viewer.
- Attempted state and notes persisted through `/api/pyq-progress`.
- Revision tab removed; notes section usability improved.
- Content upload for all years through the dashboard.

**Done when**
- [ ] Every year and subject in scope has content with solutions.
- [ ] Users never leave the site to read a PDF.
- [ ] Progress and notes survive a different device.

## Phase 4 — QuizEngine

- `Topic` gets a mode (viva / NPTEL) and an image; graph view removed.
- Two-mode UI with subject photo cards.
- Per-subject question JSON import, fed from the admin dashboard; `Question.source` added.

**Done when**
- [ ] Both modes list their topics with photo cards.
- [ ] A new JSON file for a subject imports without code changes.

## Phase 5 — Sign-in providers and homepage

- GitHub and Microsoft sign-in alongside Google.
- Homepage: auth buttons under the headline, two tool groups, Engineering Tracker and Programming hidden, footer on its own page, onboarding for new users.

**Done when**
- [ ] Logged-out visitors see the preview with login and register.
- [ ] A new user is guided through onboarding on first login.

## Phase 6 — SGPA/CGPA and Internal Marks

- SGPA/CGPA: mini cards, credits dropdown (1–6), "Qualified" grade, clear-all, PDF export and the recovery message removed, jargon explained.
- Internal Marks: BE CSE (default) and BE CSE (AIT) top level, 3rd-year general CSE, AIT specialization, explainers with example subjects.
- **Input needed from you:** the marking schemes for 3rd-year general CSE and for AIT.

**Done when**
- [ ] "Qualified" subjects never affect SGPA or CGPA.
- [ ] All BE CSE and AIT combinations in the PRD calculate correctly.

## Phase 7 — Task Tracker

- Deadline-first list with "deadline near" and "deadline missed" states.
- Kanban kept as a secondary view.
- `Task` model reshaped for deadlines.

**Done when**
- [ ] A task due soon or overdue is visibly flagged without opening anything.
- [ ] Kanban view still works from the same data.

## Risks

| Risk | Mitigation |
|------|------------|
| Cloudinary PDFs fail to load in the viewer (the area of earlier failures) | Phase 0 spike and Day 2 decision gate |
| Resources slips into exam preparation time | Phases 4–7 are cut first; Resources is never traded away |
| Marking schemes for new Internal Marks variants arrive late | Request them during Phase 3 |