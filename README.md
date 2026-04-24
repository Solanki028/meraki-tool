# Client Work Tracker

## 1. What I Built

This tool is intentionally minimal. Instead of recreating a full project management system, it focuses on one thing: helping a small team quickly understand what needs attention today.

I built a focused internal tracker for small teams who need one place to see client work without juggling WhatsApp threads, spreadsheet tabs, and memory.

The product stays centered on a single daily question: what needs attention today, and for which client? Clients live in the sidebar, projects stay grouped under the selected client, and the "Focus for today" area makes the next task obvious before users scan the rest of the workspace.

## 2. Key Decisions

- No authentication. The brief explicitly ruled it out, so the app keeps access simple and uses server-side Supabase actions instead of building an auth layer.
- Minimal feature scope. No board cloning, no drag-and-drop, no team management, and no modal-heavy flows. The UI is optimized for fast daily use.
- Single-page workflow. The core work happens on one route so the team can switch clients, scan projects, and update tasks with minimal navigation.
- Server-rendered data with server actions. Reads and writes stay straightforward, the UI refreshes cleanly, and the code avoids unnecessary client-side state management.
- Clear separation. Data access lives in `src/lib`, server actions in `src/app/actions.ts`, reusable UI in `src/components`, and the schema in `supabase/migrations`.

## 3. Features Included

- Create clients and view them in a persistent sidebar.
- Select a client and see all of its projects.
- Create projects under a client.
- Mark projects as `active` or `completed`.
- Create tasks under a project.
- Add optional due dates and short notes to tasks.
- Move tasks between `todo`, `in_progress`, and `done`.
- See project tasks grouped by status.
- See a prioritized "Focus for today" view for the selected client.
- Setup-safe demo mode when Supabase environment variables are not configured yet.

## 4. What I’d Build Next

- Real-time updates so multiple teammates see changes immediately.
- Notifications for due dates and stalled work.
- Team roles and permissions once access rules matter.
- Activity history to show what changed and when.

## 5. Trade-offs

- No authentication means anyone with access to the deployed app can use it.
- No collaboration layer means there is no per-user ownership, mentions, or presence.
- No real-time sync means users only see updates after refreshes or action revalidation.
- The app favors speed and clarity over customization, so workflows are intentionally constrained.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` into `.env.local` and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

3. Run the SQL in `supabase/migrations/20260424133000_initial_schema.sql` inside the Supabase SQL editor.

4. Start the app:

```bash
npm run dev
```

5. Optional: seed demo records into your live Supabase project:

```bash
npm run seed
```

## Deploying to Vercel

1. Push the repo to GitHub.
2. Import it into Vercel.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the Vercel project environment variables.
4. Deploy.
