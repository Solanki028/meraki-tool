export type ProjectStatus = "active" | "completed";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface Client {
  id: string;
  name: string;
  created_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  name: string;
  status: ProjectStatus;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
}

export interface ProjectWithTasks extends Project {
  tasks: Task[];
}

export interface ClientWithProjects extends Client {
  projects: ProjectWithTasks[];
}

export interface FocusTask extends Task {
  clientName: string;
  projectName: string;
}
