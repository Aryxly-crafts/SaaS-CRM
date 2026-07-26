"use client";

import { Pencil } from "lucide-react";
import { RowMenu } from "@/components/row-menu";
import type { Client, Project } from "@/lib/records";
import { ProjectForm } from "./project-form";
import { deleteProject } from "./actions";

// Overflow menu for a project row: edit or delete.
export function ProjectRowMenu({
  project,
  clients,
}: {
  project: Project;
  clients: Client[];
}) {
  return (
    <RowMenu
      label={`Actions for ${project.title}`}
      onDelete={() => deleteProject(project.id)}
      deleteLabel="Delete project"
      deletePrompt="Deletes its payments and documents too."
      items={[
        {
          label: "Edit project",
          icon: <Pencil size={13} strokeWidth={1.75} />,
          render: () => (
            <ProjectForm
              clients={clients}
              project={project}
              trigger={
                <button
                  type="button"
                  className="text-ink-muted hover:text-ink hover:bg-surface-muted flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-[12.5px] transition-colors"
                >
                  <Pencil size={13} strokeWidth={1.75} />
                  Edit project
                </button>
              }
            />
          ),
        },
      ]}
    />
  );
}
