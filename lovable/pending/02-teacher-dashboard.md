Give teachers roll-marking, and rebuild their dashboard around the day they actually have. **Code only — no SQL, no policy changes.**

## Why this matters more than it looks

`attendance` exists with correct RLS (admin, the class teacher, or that student's parent may read; only admin and the class teacher may write) — but **nothing in the app writes it**. The admin dashboard reads a roll no one can take, so its attendance figures sit permanently at "Not taken yet". This closes that circuit.

Columns: `school_id`, `student_id`, `on_date`, `status` (`present|absent|late|excused`), `note`, `recorded_by`. Unique on `(student_id, on_date)` — so marking is an **upsert on that pair**, never a blind insert, or a teacher correcting a mistake gets a constraint violation.

## 1. Roll marking

New route `src/routes/_authenticated/roll.tsx`.

- Class picker when the teacher has more than one class; skip it when they have one.
- Date defaults to today, with a control to step back a day. Do not allow marking a future date — a roll for tomorrow is not a fact.
- One row per student in the class: name left, and four status controls right — PRESENT, LATE, ABSENT, EXCUSED. Selected is ink fill with paper text; unselected is a 1px hairline border with ash text. Square, no radius.
- A 2px line per row carrying the meaning: fern present, brass late, oxide absent, ash excused. Nothing at all before the student is marked — unmarked and present must not look alike.
- Foot the screen with "N of M marked" and a Save that upserts every marked row on `(student_id, on_date)`, setting `recorded_by` to the current user. Rows left unmarked are not written; absence of a record means the roll wasn't taken for that child, which is different from any status.
- Re-opening a date must load what was already recorded and let it be corrected.

## 2. Teacher dashboard

`TeacherDashboard` in `dashboard.tsx` currently shows classes, students, unread, pending requests, forms, recent posts and upcoming events. Keep all of it and add, above the existing content:

- **Today's roll** — per class, marked-vs-total with an oxide line when a class is unmarked and fern when complete, linking to `/roll`. This should be the first thing a teacher sees before 9am.
- **Absent today** — the students marked absent or late across their classes, with the status line beside each. If no roll has been taken, say "Roll not taken" rather than showing zero absences — those are different facts and must not render alike.

Add a **Roll** entry to the teacher's Add sheet in `app-shell.tsx`, pointing at `/roll`.

## 3. Route guard

In `_authenticated/route.tsx`, `/roll` must be reachable by teachers and admins. Parents, canteen and uniform staff should be redirected away — canteen and uniform already are by their allow-lists; add `/roll` to the parent block list so a parent doesn't land on a screen the database will refuse to let them write.

## House style — non-negotiable

No shadows, no gradients, no rounded corners except true circles and the consent toggle, every rule exactly 1px, colour only as a 1–2px line, Bodoni for numerals and headings, Jost 300–400 elsewhere, uppercase labels at 0.24–0.28em tracking. Icons from `@/components/icons`, 22×22, 1px, squared terminals.

## Scope

Only the above. Nothing in the story viewer, composer, posts, canteen, admin or uniform dashboards, and no RLS policy — `attendance` is already correctly gated and I have probe-tested it.

Report the files changed and the result of `tsgo --noEmit`.
