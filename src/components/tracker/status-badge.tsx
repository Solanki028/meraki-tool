import { Badge } from "@/components/ui/badge";
import { getTaskStatusLabel } from "@/lib/tracker";
import type { ProjectStatus, TaskStatus } from "@/lib/types";

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge
      variant={status === "active" ? "secondary" : "outline"}
      className={
        status === "active"
          ? "border-zinc-200 bg-zinc-100 text-zinc-800"
          : "border-zinc-200 bg-white text-zinc-600"
      }
    >
      {status === "active" ? "Active" : "Completed"}
    </Badge>
  );
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge
      variant={
        status === "done" ? "secondary" : status === "in_progress" ? "default" : "outline"
      }
      className={
        status === "done"
          ? "border-zinc-200 bg-zinc-100 text-zinc-600"
          : status === "in_progress"
            ? "bg-zinc-900 text-white"
            : "border-zinc-200 bg-white text-zinc-700"
      }
    >
      {getTaskStatusLabel(status)}
    </Badge>
  );
}
