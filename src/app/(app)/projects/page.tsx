import { FolderKanban, AlertTriangle } from "lucide-react";
import { SetPageTitle } from "../page-title-context";
import { getClients, getProjects } from "@/lib/records-data";
import {
  PROJECT_STATUS_STYLES,
  isOverdue,
  money,
  shortDate,
} from "@/lib/records";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { ProjectForm } from "./project-form";
import { ClientForm } from "./client-form";
import { ProjectRowMenu } from "./project-row-menu";

// Project tracking screen with per-row edit and delete.
export default async function ProjectsPage() {
  const [projects, clients] = await Promise.all([getProjects(), getClients()]);

  return (
    <>
      <SetPageTitle title="Projects" />
      <PageHeader
        title="Projects"
        description={`${projects.length} project${projects.length === 1 ? "" : "s"} across ${clients.length} client${clients.length === 1 ? "" : "s"}`}
        action={
          <div className="flex gap-2">
            <ClientForm />
            <ProjectForm clients={clients} />
          </div>
        }
      />

      <Card className="overflow-hidden">
        {projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban size={17} strokeWidth={1.75} />}
            title={clients.length === 0 ? "No clients yet" : "No projects yet"}
            description={
              clients.length === 0
                ? "Add a client first — or convert a won lead — then create a project against them."
                : "Create a project to track its value, payments, and deadline."
            }
            action={
              clients.length === 0 ? <ClientForm /> : <ProjectForm clients={clients} />
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-line bg-surface-muted border-b text-left">
                  {["Project", "Client", "Value", "Advance", "Final", "Deadline", "Status"].map(
                    (column) => (
                      <th
                        key={column}
                        className="text-ink-subtle px-3 py-2 text-[10px] font-semibold tracking-[0.06em] whitespace-nowrap uppercase first:pl-4"
                      >
                        {column}
                      </th>
                    )
                  )}
                  <th className="w-10 pr-3" />
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => {
                  const overdue = isOverdue(project);
                  const style = PROJECT_STATUS_STYLES[project.status];
                  return (
                    <tr
                      key={project.id}
                      className="border-line hover:bg-surface-muted border-b text-[12.5px] transition-colors last:border-b-0"
                    >
                      <td className="text-ink py-2.5 pr-3 pl-4 font-medium">
                        {project.title}
                      </td>
                      <td className="text-ink-muted px-3 py-2.5">
                        {project.client_name}
                      </td>
                      <td className="text-ink tabular px-3 py-2.5 whitespace-nowrap">
                        {money(project.total_value)}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-ink-muted tabular">
                          {money(project.advance_amount)}
                        </span>
                        {project.advance_amount !== null && (
                          <span
                            className={`ml-1.5 text-[10px] font-semibold ${project.advance_paid ? "text-[#1d7a4c]" : "text-ink-subtle"}`}
                          >
                            {project.advance_paid ? "PAID" : "DUE"}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-ink-muted tabular">
                          {money(project.final_amount)}
                        </span>
                        {project.final_amount !== null && (
                          <span
                            className={`ml-1.5 text-[10px] font-semibold ${project.final_paid ? "text-[#1d7a4c]" : "text-ink-subtle"}`}
                          >
                            {project.final_paid ? "PAID" : "DUE"}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span
                          className={`tabular inline-flex items-center gap-1 ${overdue ? "text-accent font-medium" : "text-ink-muted"}`}
                        >
                          {overdue && <AlertTriangle size={12} strokeWidth={2} />}
                          {shortDate(project.deadline)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex items-center rounded-[5px] px-1.5 py-[3px] text-[10px] font-semibold tracking-[0.04em] ${style.className}`}
                        >
                          {style.label}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3">
                        <ProjectRowMenu project={project} clients={clients} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
