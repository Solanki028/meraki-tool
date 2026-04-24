"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { ProjectStatus, TaskStatus } from "@/lib/types";

const VALID_PROJECT_STATUSES = new Set<ProjectStatus>(["active", "completed"]);
const VALID_TASK_STATUSES = new Set<TaskStatus>(["todo", "in_progress", "done"]);

function readRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing ${key}.`);
  }

  return value.trim();
}

function readOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
}

function readOptionalDate(formData: FormData, key: string) {
  const value = readOptionalString(formData, key);

  if (!value) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Invalid ${key}.`);
  }

  return value;
}

export async function createClientAction(formData: FormData) {
  const name = readRequiredString(formData, "name");
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("clients")
    .insert({ name })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Could not create client: ${error.message}`);
  }

  revalidatePath("/");
  redirect(`/?client=${data.id}`);
}

export async function createProjectAction(formData: FormData) {
  const clientId = readRequiredString(formData, "clientId");
  const name = readRequiredString(formData, "name");
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from("projects").insert({
    client_id: clientId,
    name,
    status: "active",
  });

  if (error) {
    throw new Error(`Could not create project: ${error.message}`);
  }

  revalidatePath("/");
}

export async function updateProjectStatusAction(formData: FormData) {
  const projectId = readRequiredString(formData, "projectId");
  const status = readRequiredString(formData, "status") as ProjectStatus;

  if (!VALID_PROJECT_STATUSES.has(status)) {
    throw new Error("Invalid project status.");
  }

  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from("projects").update({ status }).eq("id", projectId);

  if (error) {
    throw new Error(`Could not update project: ${error.message}`);
  }

  revalidatePath("/");
}

export async function createTaskAction(formData: FormData) {
  const projectId = readRequiredString(formData, "projectId");
  const title = readRequiredString(formData, "title");
  const description = readOptionalString(formData, "description");
  const dueDate = readOptionalDate(formData, "dueDate");
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from("tasks").insert({
    project_id: projectId,
    title,
    description,
    due_date: dueDate,
    status: "todo",
  });

  if (error) {
    throw new Error(`Could not create task: ${error.message}`);
  }

  revalidatePath("/");
}

export async function updateTaskStatusAction(formData: FormData) {
  const taskId = readRequiredString(formData, "taskId");
  const status = readRequiredString(formData, "status") as TaskStatus;

  if (!VALID_TASK_STATUSES.has(status)) {
    throw new Error("Invalid task status.");
  }

  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId);

  if (error) {
    throw new Error(`Could not update task: ${error.message}`);
  }

  revalidatePath("/");
}
