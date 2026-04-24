import { Badge } from "@/components/ui/badge";
import { getTaskStatusLabel } from "@/lib/tracker";
import type { ProjectStatus, TaskStatus } from "@/lib/types";

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant={status === "active" ? "secondary" : "outline"}>
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
    >
      {getTaskStatusLabel(status)}
    </Badge>
  );
}
