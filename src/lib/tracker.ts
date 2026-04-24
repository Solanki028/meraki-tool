import { format, isPast, isToday, parseISO, startOfDay } from "date-fns";
import { unstable_noStore as noStore } from "next/cache";

import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type {
  Client,
  ClientWithProjects,
  FocusTask,
  Project,
  ProjectStatus,
  ProjectWithTasks,
  Task,
  TaskStatus,
} from "@/lib/types";

const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In progress",
  done: "Done",
};

const TASK_STATUS_ORDER: Record<TaskStatus, number> = {
  in_progress: 0,
  todo: 1,
  done: 2,
};

const PROJECT_STATUS_ORDER: Record<ProjectStatus, number> = {
  active: 0,
  completed: 1,
};

type TrackerSnapshot = {
  clients: ClientWithProjects[];
  selectedClient: ClientWithProjects | null;
  focusTasks: FocusTask[];
  isDemoMode: boolean;
  demoMessage: string | null;
};

function getDateOffset(daysFromToday: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString();
}

function getDayOffset(daysFromToday: number) {
  return getDateOffset(daysFromToday).slice(0, 10);
}

function compareDatesAscending(a?: string | null, b?: string | null) {
  if (!a && !b) {
    return 0;
  }

  if (!a) {
    return 1;
  }

  if (!b) {
    return -1;
  }

  return parseISO(a).getTime() - parseISO(b).getTime();
}

function sortTasks(tasks: Task[]) {
  return [...tasks].sort((left, right) => {
    const statusDiff = TASK_STATUS_ORDER[left.status] - TASK_STATUS_ORDER[right.status];

    if (statusDiff !== 0) {
      return statusDiff;
    }

    const dueDiff = compareDatesAscending(left.due_date, right.due_date);

    if (dueDiff !== 0) {
      return dueDiff;
    }

    return parseISO(right.created_at).getTime() - parseISO(left.created_at).getTime();
  });
}

function sortProjects(projects: ProjectWithTasks[]) {
  return [...projects].sort((left, right) => {
    const statusDiff = PROJECT_STATUS_ORDER[left.status] - PROJECT_STATUS_ORDER[right.status];

    if (statusDiff !== 0) {
      return statusDiff;
    }

    return parseISO(left.created_at).getTime() - parseISO(right.created_at).getTime();
  });
}

function getTaskUrgency(task: Task) {
  if (!task.due_date) {
    return 3;
  }

  const dueDate = parseISO(task.due_date);
  const today = startOfDay(new Date());

  if (isPast(dueDate) && !isToday(dueDate)) {
    return 0;
  }

  if (isToday(dueDate)) {
    return 1;
  }

  return dueDate.getTime() >= today.getTime() ? 2 : 3;
}

function assertNoError(error: { message: string } | null, label: string) {
  if (error) {
    throw new Error(`${label}: ${error.message}`);
  }
}

function getDemoTrackerSnapshot(selectedClientId?: string | null): TrackerSnapshot {
  const clients: ClientWithProjects[] = [
    {
      id: "demo-client-1",
      name: "Northwind Labs",
      created_at: getDateOffset(-14),
      projects: [
        {
          id: "demo-project-1",
          client_id: "demo-client-1",
          name: "Monthly growth reports",
          status: "active",
          created_at: getDateOffset(-12),
          tasks: sortTasks([
            {
              id: "demo-task-1",
              project_id: "demo-project-1",
              title: "Review April lead sheet",
              description: "Check client comments and update the final numbers before review.",
              status: "in_progress",
              due_date: getDayOffset(0),
              created_at: getDateOffset(-2),
            },
            {
              id: "demo-task-2",
              project_id: "demo-project-1",
              title: "Send revised KPI summary",
              description: "Keep the note short and only call out dropped conversion campaigns.",
              status: "todo",
              due_date: getDayOffset(1),
              created_at: getDateOffset(-1),
            },
            {
              id: "demo-task-3",
              project_id: "demo-project-1",
              title: "Archive March report pack",
              description: "Move old files into the shared folder once the client confirms receipt.",
              status: "done",
              due_date: null,
              created_at: getDateOffset(-5),
            },
          ]),
        },
        {
          id: "demo-project-2",
          client_id: "demo-client-1",
          name: "Website fixes",
          status: "completed",
          created_at: getDateOffset(-9),
          tasks: sortTasks([
            {
              id: "demo-task-4",
              project_id: "demo-project-2",
              title: "Update contact form copy",
              description: "Completed and shared with the client last week.",
              status: "done",
              due_date: getDayOffset(-3),
              created_at: getDateOffset(-7),
            },
          ]),
        },
      ],
    },
    {
      id: "demo-client-2",
      name: "Atlas Interiors",
      created_at: getDateOffset(-10),
      projects: [
        {
          id: "demo-project-3",
          client_id: "demo-client-2",
          name: "Launch checklist",
          status: "active",
          created_at: getDateOffset(-8),
          tasks: sortTasks([
            {
              id: "demo-task-5",
              project_id: "demo-project-3",
              title: "Collect product images",
              description: "Waiting on the final living room bundle from the client.",
              status: "todo",
              due_date: getDayOffset(2),
              created_at: getDateOffset(-2),
            },
            {
              id: "demo-task-6",
              project_id: "demo-project-3",
              title: "Prepare handoff checklist",
              description: "Include domain, CMS logins, and analytics checklist.",
              status: "in_progress",
              due_date: getDayOffset(3),
              created_at: getDateOffset(-1),
            },
          ]),
        },
      ],
    },
  ];

  const selectedClient =
    clients.find((client) => client.id === selectedClientId) ?? clients[0] ?? null;

  return {
    clients,
    selectedClient,
    focusTasks: getFocusTasks(selectedClient),
    isDemoMode: true,
    demoMessage:
      "Showing demo data. Add your Supabase keys and run the SQL migration to switch to live data.",
  };
}

export async function getTrackerSnapshot(
  selectedClientId?: string | null,
): Promise<TrackerSnapshot> {
  noStore();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return getDemoTrackerSnapshot(selectedClientId);
  }

  const supabase = getSupabaseAdminClient();

  const [clientsResult, projectsResult, tasksResult] = await Promise.all([
    supabase.from("clients").select("id, name, created_at").order("created_at", { ascending: true }),
    supabase
      .from("projects")
      .select("id, client_id, name, status, created_at")
      .order("created_at", { ascending: true }),
    supabase
      .from("tasks")
      .select("id, project_id, title, description, status, due_date, created_at")
      .order("created_at", { ascending: false }),
  ]);

  assertNoError(clientsResult.error, "Failed to load clients");
  assertNoError(projectsResult.error, "Failed to load projects");
  assertNoError(tasksResult.error, "Failed to load tasks");

  const clients = (clientsResult.data ?? []) as Client[];
  const projects = (projectsResult.data ?? []) as Project[];
  const tasks = (tasksResult.data ?? []) as Task[];

  const projectsByClient = new Map<string, ProjectWithTasks[]>();
  const tasksByProject = new Map<string, Task[]>();

  for (const task of tasks) {
    const currentTasks = tasksByProject.get(task.project_id) ?? [];
    currentTasks.push(task);
    tasksByProject.set(task.project_id, currentTasks);
  }

  for (const project of projects) {
    const currentProjects = projectsByClient.get(project.client_id) ?? [];
    currentProjects.push({
      ...project,
      tasks: sortTasks(tasksByProject.get(project.id) ?? []),
    });
    projectsByClient.set(project.client_id, currentProjects);
  }

  const nestedClients = clients.map<ClientWithProjects>((client) => ({
    ...client,
    projects: sortProjects(projectsByClient.get(client.id) ?? []),
  }));

  const selectedClient =
    nestedClients.find((client) => client.id === selectedClientId) ?? nestedClients[0] ?? null;

  return {
    clients: nestedClients,
    selectedClient,
    focusTasks: getFocusTasks(selectedClient),
    isDemoMode: false,
    demoMessage: null,
  };
}

export function getFocusTasks(client: ClientWithProjects | null) {
  if (!client) {
    return [];
  }

  const focusTasks = client.projects.flatMap<FocusTask>((project) =>
    project.tasks
      .filter((task) => task.status !== "done")
      .map((task) => ({
        ...task,
        clientName: client.name,
        projectName: project.name,
      })),
  );

  return focusTasks
    .sort((left, right) => {
      const leftUrgency = getTaskUrgency(left);
      const rightUrgency = getTaskUrgency(right);

      if (leftUrgency !== rightUrgency) {
        return leftUrgency - rightUrgency;
      }

      const statusDiff = TASK_STATUS_ORDER[left.status] - TASK_STATUS_ORDER[right.status];

      if (statusDiff !== 0) {
        return statusDiff;
      }

      return compareDatesAscending(left.due_date, right.due_date);
    })
    .slice(0, 6);
}

export function groupTasksByStatus(tasks: Task[]) {
  return {
    todo: tasks.filter((task) => task.status === "todo"),
    in_progress: tasks.filter((task) => task.status === "in_progress"),
    done: tasks.filter((task) => task.status === "done"),
  };
}

export function getTaskStatusLabel(status: TaskStatus) {
  return TASK_STATUS_LABELS[status];
}

export function formatDueDateLabel(dueDate?: string | null) {
  if (!dueDate) {
    return "No due date";
  }

  const parsedDate = parseISO(dueDate);

  if (isPast(parsedDate) && !isToday(parsedDate)) {
    return `Overdue - ${format(parsedDate, "d MMM")}`;
  }

  if (isToday(parsedDate)) {
    return "Due today";
  }

  return `Due ${format(parsedDate, "d MMM")}`;
}

export function getClientTaskCounts(client: ClientWithProjects) {
  const projects = client.projects.length;
  const tasks = client.projects.flatMap((project) => project.tasks);

  return {
    projects,
    totalTasks: tasks.length,
    openTasks: tasks.filter((task) => task.status !== "done").length,
    inProgressTasks: tasks.filter((task) => task.status === "in_progress").length,
  };
}
