import type { ComponentType } from "react";
import Link from "next/link";
import { BriefcaseBusiness, CalendarClock, CircleCheckBig, FolderKanban } from "lucide-react";

import { ClientForm, ProjectForm, ProjectStatusForm, TaskForm, TaskStatusForm } from "@/components/tracker/forms";
import { ProjectStatusBadge, TaskStatusBadge } from "@/components/tracker/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  formatDueDateLabel,
  getClientTaskCounts,
  getTrackerSnapshot,
  getTaskStatusLabel,
  groupTasksByStatus,
} from "@/lib/tracker";
import type { ClientWithProjects, FocusTask, ProjectWithTasks, Task, TaskStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const TASK_COLUMNS: TaskStatus[] = ["todo", "in_progress", "done"];

function ClientSidebar({
  clients,
  selectedClientId,
  isDemoMode = false,
}: {
  clients: ClientWithProjects[];
  selectedClientId?: string;
  isDemoMode?: boolean;
}) {
  return (
    <aside className="border-b border-zinc-200 bg-white md:border-r md:border-b-0">
      <div className="flex h-full flex-col gap-5 p-4 md:sticky md:top-0 md:h-screen md:w-[320px] md:p-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
            Client Work Tracker
          </p>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Today&apos;s client work</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Pick a client, review active projects, and move tasks forward without extra steps.
            </p>
          </div>
        </div>

        <Card size="sm" className="bg-zinc-50">
          <CardHeader className="pb-0">
            <CardTitle>Add client</CardTitle>
            <CardDescription>
              {isDemoMode
                ? "Demo mode is read-only until Supabase is connected."
                : "Keep the list current as new client work starts."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isDemoMode ? (
              <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-3 text-sm text-zinc-500">
                Client creation is disabled in demo mode.
              </div>
            ) : (
              <ClientForm />
            )}
          </CardContent>
        </Card>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-950">Clients</h2>
            <span className="text-xs text-zinc-500">{clients.length} total</span>
          </div>
          <div className="space-y-2 overflow-y-auto pr-1">
            {clients.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-500">
                Add your first client to start tracking work.
              </div>
            ) : (
              clients.map((client) => {
                const counts = getClientTaskCounts(client);
                const isSelected = client.id === selectedClientId;

                return (
                  <Link
                    key={client.id}
                    href={`/?client=${client.id}`}
                    className={cn(
                      "block rounded-xl border p-3 transition-colors",
                      isSelected
                        ? "border-zinc-950 bg-zinc-950 text-white"
                        : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p
                          className={cn(
                            "mt-1 text-xs",
                            isSelected ? "text-zinc-300" : "text-zinc-500",
                          )}
                        >
                          {counts.projects} projects
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          isSelected ? "bg-white/12 text-white" : "bg-zinc-100 text-zinc-700",
                        )}
                      >
                        {counts.openTasks} open
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

function SummaryCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string;
  hint: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="bg-white">
      <CardContent className="flex items-start justify-between gap-4 pt-4">
        <div>
          <p className="text-sm text-zinc-500">{title}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-zinc-950">{value}</p>
          <p className="mt-1 text-sm text-zinc-600">{hint}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-2">
          <Icon className="size-4 text-zinc-700" />
        </div>
      </CardContent>
    </Card>
  );
}

function FocusPanel({
  client,
  focusTasks,
}: {
  client: ClientWithProjects;
  focusTasks: FocusTask[];
}) {
  const counts = getClientTaskCounts(client);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Selected client</p>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">{client.name}</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Clear view of current projects and what needs attention next.
          </p>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <SummaryCard
          title="Open tasks"
          value={String(counts.openTasks)}
          hint="Tasks not yet marked done"
          icon={FolderKanban}
        />
        <SummaryCard
          title="In progress"
          value={String(counts.inProgressTasks)}
          hint="Work already in motion"
          icon={BriefcaseBusiness}
        />
        <SummaryCard
          title="Projects"
          value={String(counts.projects)}
          hint="Active and completed visible together"
          icon={CircleCheckBig}
        />
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Focus for today</CardTitle>
          <CardDescription>
            The next tasks to review first based on status and due dates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {focusTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-500">
              No open tasks for this client. Add a task when new work comes in.
            </div>
          ) : (
            focusTasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-zinc-950">{task.title}</p>
                    <TaskStatusBadge status={task.status} />
                  </div>
                  <p className="mt-1 text-sm text-zinc-600">{task.projectName}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <CalendarClock className="size-4" />
                  <span>{formatDueDateLabel(task.due_date)}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function TaskCard({ task, isDemoMode = false }: { task: Task; isDemoMode?: boolean }) {
  return (
    <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-zinc-950">{task.title}</p>
          <TaskStatusBadge status={task.status} />
        </div>
        {task.description ? <p className="text-sm leading-6 text-zinc-600">{task.description}</p> : null}
      </div>
      <div className="flex items-center justify-between gap-3 text-xs text-zinc-500">
        <span>{formatDueDateLabel(task.due_date)}</span>
        <span>{getTaskStatusLabel(task.status)}</span>
      </div>
      <TaskStatusForm taskId={task.id} currentStatus={task.status} disabled={isDemoMode} />
    </div>
  );
}

function ProjectCard({
  project,
  isDemoMode = false,
}: {
  project: ProjectWithTasks;
  isDemoMode?: boolean;
}) {
  const groupedTasks = groupTasksByStatus(project.tasks);
  const openTasks = project.tasks.filter((task) => task.status !== "done").length;

  return (
    <Card className="bg-white">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>{project.name}</CardTitle>
              <ProjectStatusBadge status={project.status} />
            </div>
            <CardDescription>
              {openTasks} open tasks across {project.tasks.length} total.
            </CardDescription>
          </div>
          <ProjectStatusForm projectId={project.id} status={project.status} disabled={isDemoMode} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <TaskForm projectId={project.id} disabled={isDemoMode} />
        <div className="grid gap-3 xl:grid-cols-3">
          {TASK_COLUMNS.map((status) => {
            const tasks = groupedTasks[status];

            return (
              <section
                key={status}
                className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-950">{getTaskStatusLabel(status)}</h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs text-zinc-600">
                    {tasks.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {tasks.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-3 text-sm text-zinc-500">
                      No tasks here yet.
                    </div>
                  ) : (
                    tasks.map((task) => <TaskCard key={task.id} task={task} isDemoMode={isDemoMode} />)
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

type PageProps = {
  searchParams?: Promise<{
    client?: string;
  }>;
};

export default async function Home({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedClientId = resolvedSearchParams?.client;
  const { clients, selectedClient, focusTasks, isDemoMode, demoMessage } =
    await getTrackerSnapshot(selectedClientId);

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950">
      <div className="md:grid md:grid-cols-[320px_minmax(0,1fr)]">
        <ClientSidebar clients={clients} selectedClientId={selectedClient?.id} isDemoMode={isDemoMode} />

        <section className="min-w-0 p-4 md:p-8">
          {isDemoMode && demoMessage ? (
            <div className="mx-auto mb-4 max-w-7xl rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-700">
              <span className="font-medium text-zinc-950">Demo mode:</span> {demoMessage}
            </div>
          ) : null}

          {!selectedClient ? (
            <Card className="mx-auto mt-12 max-w-2xl bg-white">
              <CardHeader>
                <CardTitle>No client selected</CardTitle>
                <CardDescription>
                  Add your first client from the sidebar to start tracking projects and tasks.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="mx-auto flex max-w-7xl flex-col gap-6">
              <FocusPanel client={selectedClient} focusTasks={focusTasks} />

              <Separator />

              <section className="space-y-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
                      Projects
                    </p>
                    <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
                      Work by project
                    </h2>
                  </div>
                  <p className="text-sm text-zinc-600">
                    {isDemoMode
                      ? "This is sample data so you can confirm the app is rendering correctly."
                      : "Active projects stay on top. Completed work remains visible for reference."}
                  </p>
                </div>

                <ProjectForm clientId={selectedClient.id} disabled={isDemoMode} />

                <div className="space-y-4">
                  {selectedClient.projects.length === 0 ? (
                    <Card className="bg-white">
                      <CardHeader>
                        <CardTitle>No projects yet</CardTitle>
                        <CardDescription>
                          Create the first project for {selectedClient.name} and start adding tasks.
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ) : (
                    selectedClient.projects.map((project) => (
                      <ProjectCard key={project.id} project={project} isDemoMode={isDemoMode} />
                    ))
                  )}
                </div>
              </section>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
