import type { ComponentType } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BriefcaseBusiness,
  CircleCheckBig,
  FolderKanban,
} from "lucide-react";

import { ClientForm, ProjectForm, ProjectStatusForm, TaskForm, TaskStatusForm } from "@/components/tracker/forms";
import { ProjectStatusBadge, TaskStatusBadge } from "@/components/tracker/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  formatDueDateLabel,
  getClientTaskCounts,
  getFocusTaskLabel,
  getFocusTaskTone,
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
    <aside className="border-b border-zinc-200/80 bg-white/95 md:border-r md:border-b-0">
      <div className="flex h-full flex-col gap-5 p-4 md:sticky md:top-0 md:h-screen md:w-[320px] md:p-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
            Client Work Tracker
          </p>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Today&apos;s client work</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Focus on what matters today. Your work, organized by client. No noise.
            </p>
          </div>
        </div>

        <Card size="sm" className="border-zinc-200 bg-zinc-50 shadow-sm">
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
                      "block rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5",
                      isSelected
                        ? "border-zinc-950 bg-zinc-950 text-white"
                        : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md",
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
    <Card className="border-zinc-200 bg-white shadow-sm">
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

function FocusTaskCard({ task }: { task: FocusTask }) {
  const tone = getFocusTaskTone(task);
  const toneLabel = getFocusTaskLabel(task);

  const toneClasses =
    tone === "overdue"
      ? "border-l-red-300 bg-red-50/40"
      : tone === "today"
        ? "border-l-amber-300 bg-amber-50/40"
        : tone === "active"
          ? "border-l-zinc-900 bg-zinc-50"
          : "border-l-zinc-200 bg-white";

  const dotClasses =
    tone === "overdue"
      ? "bg-red-400"
      : tone === "today"
        ? "bg-amber-400"
        : tone === "active"
          ? "bg-zinc-900"
          : "bg-zinc-300";

  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200 border-l-4 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        toneClasses,
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("size-2 rounded-full", dotClasses)} />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              {toneLabel}
            </span>
          </div>
          <p className="text-lg font-semibold tracking-tight text-zinc-950">{task.title}</p>
          <p className="text-sm text-zinc-500">
            {task.projectName}
            {task.due_date ? ` • ${formatDueDateLabel(task.due_date)}` : ""}
          </p>
        </div>
        <TaskStatusBadge status={task.status} />
      </div>
    </div>
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
    <section className="space-y-5">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Focus for today</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">{client.name}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Open this and you should know what matters next: overdue work first, then what is due
              today, then the tasks already in motion.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            <AlertCircle className="size-4" />
            <span>Small-team workflow, zero noise</span>
          </div>
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

      <Card className="border-zinc-200 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>What needs attention next</CardTitle>
          <CardDescription>
            Overdue and due-today work stays at the top so the next move is obvious.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {focusTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-5 text-sm text-zinc-500">
              No tasks yet. Add your first task to get started.
            </div>
          ) : (
            focusTasks.map((task) => <FocusTaskCard key={task.id} task={task} />)
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function TaskCard({ task, isDemoMode = false }: { task: Task; isDemoMode?: boolean }) {
  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-base font-semibold tracking-tight text-zinc-950">{task.title}</p>
          <TaskStatusBadge status={task.status} />
        </div>
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
          {formatDueDateLabel(task.due_date)}
        </p>
        {task.description ? <p className="text-sm leading-6 text-zinc-600">{task.description}</p> : null}
      </div>
      <div className="flex items-center justify-between gap-3 text-xs text-zinc-500">
        <span>One-click status update</span>
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
    <Card className="border-zinc-200 bg-white shadow-sm">
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
        <div className="grid gap-4 xl:grid-cols-3">
          {TASK_COLUMNS.map((status) => {
            const tasks = groupedTasks[status];

            return (
              <section
                key={status}
                className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-950">{getTaskStatusLabel(status)}</h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs text-zinc-600">
                    {tasks.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {tasks.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-4 text-sm text-zinc-500">
                      No tasks yet. Add your first task to get started.
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
            <div className="mx-auto mb-4 max-w-7xl rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-700 shadow-sm">
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
                      : "Adding a task is one obvious action, and changing status stays one click."}
                  </p>
                </div>

                <ProjectForm clientId={selectedClient.id} disabled={isDemoMode} />

                <div className="space-y-4">
                  {selectedClient.projects.length === 0 ? (
                    <Card className="bg-white">
                      <CardHeader>
                        <CardTitle>No projects yet</CardTitle>
                        <CardDescription>
                          Create a project for {selectedClient.name} to start organizing work.
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
