"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { RowMenu } from "@/components/row-menu";
import type { Client, Project } from "@/lib/records";
import { ProjectForm } from "./project-form";
import { deleteProject } from "./actions";

// Row actions for a project: edit or delete.
export function ProjectRowMenu({
  project,
  clients,
}: {
  project: Project;
  clients: Client[];
}) {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <RowMenu
        label={`Actions for ${project.title}`}
        onDelete={() => deleteProject(project.id)}
        deleteLabel="Delete project"
        deletePrompt="Deletes its payments and documents too."
        items={[
          {
            label: "Edit project",
            icon: <Pencil size={13} strokeWidth={1.75} />,
            onSelect: () => setEditing(true),
          },
        ]}
      />

      <ProjectForm
        clients={clients}
        project={project}
        open={editing}
        onOpenChange={setEditing}
      />
    </>
  );
}
