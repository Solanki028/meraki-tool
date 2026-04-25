import type { ComponentType } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BriefcaseBusiness,
  CircleCheckBig,
  FolderKanban,
  Menu,
} from "lucide-react";

import { MobileNav } from "@/components/tracker/mobile-nav";

import { BrandLogo } from "@/components/brand/brand-logo";
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

function SidebarBrand() {
  return (
    <div className="flex items-center gap-3 px-1 py-2">
      <div className="shrink-0">
        <BrandLogo size={32} tone="muted" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold leading-tight text-[#4d1c49]">
          Meraki Workspace
        </p>
        <p className="text-[11px] text-zinc-500">Client Work Tracker</p>
      </div>
    </div>
  );
}

function DashboardEntryEmptyState() {
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-lg border border-zinc-200 bg-zinc-50/50 p-8 text-center shadow-sm">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#f2e4ec] ring-1 ring-[#dfc8d7]">
          <BrandLogo size={48} />
        </div>
        <div className="mt-6 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a5572]">
            Welcome
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
            Meraki Dashboard
          </h2>
          <p className="text-sm text-zinc-600">
            Select a client from the sidebar or add a new one to begin tracking projects and tasks.
          </p>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({
  clients,
  selectedClientId,
  isDemoMode = false,
}: {
  clients: ClientWithProjects[];
  selectedClientId?: string;
  isDemoMode?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 p-4 h-full">
      <SidebarBrand />

      <Card size="sm" className="border-zinc-200 bg-white shadow-none">
        <CardHeader className="pb-0">
          <CardTitle>Clients</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {isDemoMode ? (
            <div className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-2 text-xs text-zinc-500">
              Disabled in demo.
            </div>
          ) : (
            <ClientForm />
          )}
        </CardContent>
      </Card>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider">Directory</h2>
          <span className="text-[10px] text-zinc-400">{clients.length}</span>
        </div>
        <div className="space-y-0.5 overflow-y-auto pr-1 pb-4">
          {clients.length === 0 ? (
            <div className="rounded-md border border-dashed border-zinc-300 bg-white p-3 text-xs text-zinc-500">
              No clients yet.
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
                    "block rounded-md px-3 py-2 transition-colors",
                    isSelected
                      ? "bg-[#f2e4ec] text-zinc-950"
                      : "text-zinc-700 hover:bg-zinc-200/50",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{client.name}</p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
                        isSelected ? "bg-[#e5c9da] text-[#5f2557]" : "bg-zinc-200 text-zinc-600",
                      )}
                    >
                      {counts.openTasks}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
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
    <Card className="border-zinc-200 bg-white shadow-none" size="sm">
      <CardContent className="flex items-start justify-between gap-3 pt-3">
        <div>
          <p className="text-xs font-medium text-zinc-500">{title}</p>
          <p className="text-2xl font-semibold tracking-tight text-zinc-950">{value}</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">{hint}</p>
        </div>
        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-1.5">
          <Icon className="size-3.5 text-zinc-600" />
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
      ? "border-l-red-400 bg-red-50/30"
      : tone === "today"
        ? "border-l-amber-400 bg-amber-50/30"
        : tone === "active"
          ? "border-l-zinc-700 bg-zinc-50/50"
          : "border-l-zinc-300 bg-white";

  const dotClasses =
    tone === "overdue"
      ? "bg-red-500"
      : tone === "today"
        ? "bg-amber-500"
        : tone === "active"
          ? "bg-zinc-700"
          : "bg-zinc-400";

  return (
    <div
      className={cn(
        "rounded-md border border-zinc-200 border-l-[3px] p-3 transition-colors hover:bg-zinc-50/80",
        toneClasses,
      )}
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-1.5">
            <span className={cn("size-1.5 rounded-full", dotClasses)} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              {toneLabel}
            </span>
          </div>
          <p className="text-sm font-medium text-zinc-950">{task.title}</p>
          <p className="text-xs text-zinc-500">
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
    <section className="space-y-4">
      <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Focus View</p>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-950">{client.name}</h2>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-medium text-zinc-600">
            <AlertCircle className="size-3" />
            <span>Priority sorted</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
        <SummaryCard
          title="Open tasks"
          value={String(counts.openTasks)}
          hint="Unfinished work"
          icon={FolderKanban}
        />
        <SummaryCard
          title="In progress"
          value={String(counts.inProgressTasks)}
          hint="Active now"
          icon={BriefcaseBusiness}
        />
        <SummaryCard
          title="Projects"
          value={String(counts.projects)}
          hint="All time"
          icon={CircleCheckBig}
        />
      </div>

      <Card className="border-zinc-200 bg-white shadow-none">
        <CardHeader className="pb-3 border-b border-zinc-100">
          <CardTitle>Attention Required</CardTitle>
          <CardDescription>
            High priority items sorted by due date.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 pt-3">
          {focusTasks.length === 0 ? (
            <div className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-4 text-xs text-zinc-500 text-center">
              All caught up. No immediate focus tasks.
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
    <div className="space-y-2 rounded-md border border-zinc-200 bg-white p-3 shadow-sm hover:border-zinc-300 transition-colors">
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-tight text-zinc-950">{task.title}</p>
          <TaskStatusBadge status={task.status} />
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          {formatDueDateLabel(task.due_date)}
        </p>
        {task.description ? <p className="text-xs text-zinc-600 line-clamp-2">{task.description}</p> : null}
      </div>
      <div className="pt-2 border-t border-zinc-100 mt-2">
        <TaskStatusForm taskId={task.id} currentStatus={task.status} disabled={isDemoMode} />
      </div>
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
    <Card className="border-zinc-200 bg-white shadow-none">
      <CardHeader className="gap-2 pb-3 border-b border-zinc-100">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
              <ProjectStatusBadge status={project.status} />
            </div>
            <CardDescription className="text-xs">
              {openTasks} open tasks / {project.tasks.length} total
            </CardDescription>
          </div>
          <ProjectStatusForm projectId={project.id} status={project.status} disabled={isDemoMode} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4 bg-zinc-50/30">
        <TaskForm projectId={project.id} disabled={isDemoMode} />
        <div className="grid gap-4 md:grid-cols-3">
          {TASK_COLUMNS.map((status) => {
            const tasks = groupedTasks[status];

            return (
              <section
                key={status}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{getTaskStatusLabel(status)}</h3>
                  <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700">
                    {tasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {tasks.length === 0 ? (
                    <div className="rounded-md border border-dashed border-zinc-200 bg-transparent p-3 text-[11px] text-zinc-400">
                      No tasks
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
    <main className="flex h-screen w-full flex-col overflow-hidden bg-zinc-100 text-zinc-950 font-sans md:flex-row">
      <MobileNav>
        <SidebarContent
          clients={clients}
          selectedClientId={selectedClient?.id}
          isDemoMode={isDemoMode}
        />
      </MobileNav>

      <aside className="hidden border-r border-zinc-200 bg-zinc-50/80 flex-col h-screen overflow-hidden md:flex md:w-[260px] lg:w-[280px]">
        <SidebarContent
          clients={clients}
          selectedClientId={selectedClient?.id}
          isDemoMode={isDemoMode}
        />
      </aside>

      <section className="flex-1 overflow-y-auto bg-white border-l border-zinc-200">
        <div className="p-6 md:p-8 lg:p-10 max-w-6xl mx-auto">
          {isDemoMode && demoMessage ? (
            <div className="mb-4 rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-xs text-zinc-700">
              <span className="font-semibold text-zinc-950">Demo mode:</span> {demoMessage}
            </div>
          ) : null}

          {!selectedClient ? (
            <DashboardEntryEmptyState />
          ) : (
            <div className="flex flex-col gap-8">
              <FocusPanel client={selectedClient} focusTasks={focusTasks} />

              <Separator className="bg-zinc-100" />

              <section className="space-y-4">
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Projects
                  </p>
                  <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
                    Project Directory
                  </h2>
                </div>

                <ProjectForm clientId={selectedClient.id} disabled={isDemoMode} />

                <div className="space-y-4">
                  {selectedClient.projects.length === 0 ? (
                    <Card className="bg-zinc-50/50 shadow-none border-dashed border-zinc-300">
                      <CardContent className="py-8 text-center">
                        <p className="text-sm font-medium text-zinc-950">No projects found</p>
                        <p className="text-xs text-zinc-500 mt-1">
                          Create a project to start organizing tasks.
                        </p>
                      </CardContent>
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
        </div>
      </section>
    </main>
  );
}
