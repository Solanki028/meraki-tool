"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

import {
  createClientAction,
  createProjectAction,
  createTaskAction,
  updateProjectStatusAction,
  updateTaskStatusAction,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ProjectStatus, TaskStatus } from "@/lib/types";

function SubmitButton({
  children,
  pendingLabel,
  className,
  variant = "default",
  size = "default",
  disabled = false,
}: {
  children: ReactNode;
  pendingLabel: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button className={className} disabled={pending || disabled} size={size} variant={variant} type="submit">
      {pending ? pendingLabel : children}
    </Button>
  );
}

export function ClientForm() {
  return (
    <form action={createClientAction} className="space-y-2">
      <Input
        name="name"
        placeholder="Add a client"
        aria-label="Client name"
        className="bg-white"
        required
      />
      <SubmitButton pendingLabel="Adding client..." className="w-full">
        Save client
      </SubmitButton>
    </form>
  );
}

export function ProjectForm({ clientId, disabled = false }: { clientId: string; disabled?: boolean }) {
  return (
    <form
      action={createProjectAction}
      className="grid gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-3 md:grid-cols-[minmax(0,1fr)_auto]"
    >
      <input type="hidden" name="clientId" value={clientId} />
      <Input
        name="name"
        placeholder="New project name"
        aria-label="Project name"
        className="bg-white"
        disabled={disabled}
        required
      />
      <SubmitButton pendingLabel="Adding project..." className="w-full md:w-auto" disabled={disabled}>
        Add project
      </SubmitButton>
    </form>
  );
}

export function ProjectStatusForm({
  projectId,
  status,
  disabled = false,
}: {
  projectId: string;
  status: ProjectStatus;
  disabled?: boolean;
}) {
  const nextStatus: ProjectStatus = status === "active" ? "completed" : "active";

  return (
    <form action={updateProjectStatusAction}>
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="status" value={nextStatus} />
      <SubmitButton
        pendingLabel="Saving..."
        size="sm"
        variant={status === "active" ? "outline" : "secondary"}
        disabled={disabled}
      >
        {status === "active" ? "Mark completed" : "Reopen project"}
      </SubmitButton>
    </form>
  );
}

export function TaskForm({ projectId, disabled = false }: { projectId: string; disabled?: boolean }) {
  return (
    <form action={createTaskAction} className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-3">
      <input type="hidden" name="projectId" value={projectId} />
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_200px]">
        <Input name="title" placeholder="Task title" aria-label="Task title" disabled={disabled} required />
        <Input name="dueDate" type="date" aria-label="Due date" disabled={disabled} />
      </div>
      <Textarea
        name="description"
        placeholder="Short note or context (optional)"
        aria-label="Task note"
        className="min-h-20 resize-none"
        disabled={disabled}
      />
      <div className="flex justify-end">
        <SubmitButton pendingLabel="Adding task..." disabled={disabled}>Add task</SubmitButton>
      </div>
    </form>
  );
}

function TaskStatusButton({
  currentStatus,
  value,
  label,
  disabled = false,
}: {
  currentStatus: TaskStatus;
  value: TaskStatus;
  label: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  const isActive = currentStatus === value;

  return (
    <button
      type="submit"
      name="status"
      value={value}
      disabled={pending || disabled}
      className={cn(
        "rounded-md px-2 py-1 text-xs font-medium transition-colors",
        isActive ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-white hover:text-zinc-950",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      {label}
    </button>
  );
}

export function TaskStatusForm({
  taskId,
  currentStatus,
  disabled = false,
}: {
  taskId: string;
  currentStatus: TaskStatus;
  disabled?: boolean;
}) {
  return (
    <form action={updateTaskStatusAction}>
      <input type="hidden" name="taskId" value={taskId} />
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-zinc-100 p-1">
        <TaskStatusButton currentStatus={currentStatus} value="todo" label="Todo" disabled={disabled} />
        <TaskStatusButton currentStatus={currentStatus} value="in_progress" label="In progress" disabled={disabled} />
        <TaskStatusButton currentStatus={currentStatus} value="done" label="Done" disabled={disabled} />
      </div>
    </form>
  );
}
