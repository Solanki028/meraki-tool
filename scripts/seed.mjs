import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@supabase/supabase-js";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const envContents = readFileSync(filePath, "utf8");

  for (const rawLine of envContents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadEnvFile(resolve(process.cwd(), ".env.local"));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const clientSeeds = [
    { name: "Northwind Labs" },
    { name: "Atlas Interiors" },
    { name: "Meridian Health Studio" },
  ];

  const existingClientsResult = await supabase
    .from("clients")
    .select("id, name")
    .in(
      "name",
      clientSeeds.map((client) => client.name),
    );

  if (existingClientsResult.error) {
    throw new Error(`Failed to check existing clients: ${existingClientsResult.error.message}`);
  }

  const existingClientNames = new Set(
    (existingClientsResult.data ?? []).map((client) => client.name),
  );

  if (existingClientNames.size === clientSeeds.length) {
    console.log("Seed data already appears to exist. No new records inserted.");
    return;
  }

  const insertedClientsResult = await supabase
    .from("clients")
    .insert(clientSeeds.filter((client) => !existingClientNames.has(client.name)))
    .select("id, name");

  if (insertedClientsResult.error) {
    throw new Error(`Failed to insert clients: ${insertedClientsResult.error.message}`);
  }

  const allClientsByName = new Map(
    [...(existingClientsResult.data ?? []), ...(insertedClientsResult.data ?? [])].map((client) => [
      client.name,
      client.id,
    ]),
  );

  const projectSeeds = [
    {
      client_id: allClientsByName.get("Northwind Labs"),
      name: "Monthly growth reports",
      status: "active",
    },
    {
      client_id: allClientsByName.get("Northwind Labs"),
      name: "Website fixes",
      status: "completed",
    },
    {
      client_id: allClientsByName.get("Atlas Interiors"),
      name: "Launch checklist",
      status: "active",
    },
    {
      client_id: allClientsByName.get("Meridian Health Studio"),
      name: "SEO cleanup",
      status: "active",
    },
  ];

  const existingProjectsResult = await supabase
    .from("projects")
    .select("id, name, client_id")
    .in(
      "name",
      projectSeeds.map((project) => project.name),
    );

  if (existingProjectsResult.error) {
    throw new Error(`Failed to check existing projects: ${existingProjectsResult.error.message}`);
  }

  const existingProjectKeys = new Set(
    (existingProjectsResult.data ?? []).map((project) => `${project.client_id}:${project.name}`),
  );

  const missingProjects = projectSeeds.filter(
    (project) => project.client_id && !existingProjectKeys.has(`${project.client_id}:${project.name}`),
  );

  const insertedProjectsResult =
    missingProjects.length > 0
      ? await supabase.from("projects").insert(missingProjects).select("id, name, client_id")
      : { data: [], error: null };

  if (insertedProjectsResult.error) {
    throw new Error(`Failed to insert projects: ${insertedProjectsResult.error.message}`);
  }

  const allProjectsByKey = new Map(
    [...(existingProjectsResult.data ?? []), ...(insertedProjectsResult.data ?? [])].map((project) => [
      `${project.client_id}:${project.name}`,
      project.id,
    ]),
  );

  const taskSeeds = [
    {
      project_id: allProjectsByKey.get(`${allClientsByName.get("Northwind Labs")}:Monthly growth reports`),
      title: "Review April lead sheet",
      description: "Check client comments and update the final numbers before review.",
      status: "in_progress",
      due_date: new Date().toISOString().slice(0, 10),
    },
    {
      project_id: allProjectsByKey.get(`${allClientsByName.get("Northwind Labs")}:Monthly growth reports`),
      title: "Send revised KPI summary",
      description: "Keep the note short and only call out dropped conversion campaigns.",
      status: "todo",
      due_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    },
    {
      project_id: allProjectsByKey.get(`${allClientsByName.get("Northwind Labs")}:Website fixes`),
      title: "Update contact form copy",
      description: "Completed and shared with the client last week.",
      status: "done",
      due_date: null,
    },
    {
      project_id: allProjectsByKey.get(`${allClientsByName.get("Atlas Interiors")}:Launch checklist`),
      title: "Collect product images",
      description: "Waiting on the final living room bundle from the client.",
      status: "todo",
      due_date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
    },
    {
      project_id: allProjectsByKey.get(`${allClientsByName.get("Atlas Interiors")}:Launch checklist`),
      title: "Prepare handoff checklist",
      description: "Include domain, CMS logins, and analytics checklist.",
      status: "in_progress",
      due_date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    },
    {
      project_id: allProjectsByKey.get(`${allClientsByName.get("Meridian Health Studio")}:SEO cleanup`),
      title: "Fix duplicate meta titles",
      description: "Update top traffic pages first before touching the long-tail articles.",
      status: "todo",
      due_date: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10),
    },
    {
      project_id: allProjectsByKey.get(`${allClientsByName.get("Meridian Health Studio")}:SEO cleanup`),
      title: "Share redirect list with developer",
      description: "Need approval on the final old-to-new URL mapping.",
      status: "done",
      due_date: null,
    },
  ];

  const existingTasksResult = await supabase
    .from("tasks")
    .select("id, title, project_id")
    .in(
      "title",
      taskSeeds.map((task) => task.title),
    );

  if (existingTasksResult.error) {
    throw new Error(`Failed to check existing tasks: ${existingTasksResult.error.message}`);
  }

  const existingTaskKeys = new Set(
    (existingTasksResult.data ?? []).map((task) => `${task.project_id}:${task.title}`),
  );

  const missingTasks = taskSeeds.filter(
    (task) => task.project_id && !existingTaskKeys.has(`${task.project_id}:${task.title}`),
  );

  if (missingTasks.length > 0) {
    const insertedTasksResult = await supabase.from("tasks").insert(missingTasks);

    if (insertedTasksResult.error) {
      throw new Error(`Failed to insert tasks: ${insertedTasksResult.error.message}`);
    }
  }

  console.log("Seed data inserted successfully.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
