import { FileText } from "lucide-react";
import { SetPageTitle } from "../page-title-context";
import { getDocuments, getProjects } from "@/lib/records-data";
import { DOCUMENT_TYPE_LABELS, shortDate } from "@/lib/records";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { DocumentForm } from "./document-form";
import { DocumentRowMenu } from "./document-row-menu";

// Document library backed by a private Supabase Storage bucket.
export default async function DocumentsPage() {
  const [documents, projects] = await Promise.all([
    getDocuments(),
    getProjects(),
  ]);

  return (
    <>
      <SetPageTitle title="Documents" />
      <PageHeader
        title="Documents"
        description={`${documents.length} file${documents.length === 1 ? "" : "s"} stored`}
        action={<DocumentForm projects={projects} />}
      />

      <Card className="overflow-hidden">
        {documents.length === 0 ? (
          <EmptyState
            icon={<FileText size={17} strokeWidth={1.75} />}
            title={projects.length === 0 ? "No projects yet" : "No documents yet"}
            description={
              projects.length === 0
                ? "Create a project first, then upload its agreement, SOW, or invoices."
                : "Upload agreements, scopes of work, and invoices to keep them with their project."
            }
            action={
              projects.length > 0 ? <DocumentForm projects={projects} /> : undefined
            }
          />
        ) : (
          <div className="scroll-hidden overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-line bg-surface-muted border-b text-left">
                  {["Added", "File", "Project", "Type"].map((column) => (
                    <th
                      key={column}
                      className="text-ink-subtle px-3 py-2 text-[10px] font-semibold tracking-[0.06em] whitespace-nowrap uppercase first:pl-4"
                    >
                      {column}
                    </th>
                  ))}
                  <th className="w-10 pr-3" />
                </tr>
              </thead>
              <tbody>
                {documents.map((document) => (
                  <tr
                    key={document.id}
                    className="border-line hover:bg-surface-muted border-b text-[12.5px] transition-colors last:border-b-0"
                  >
                    <td className="text-ink-muted tabular py-2.5 pr-3 pl-4 whitespace-nowrap">
                      {shortDate(document.created_at)}
                    </td>
                    <td className="text-ink px-3 py-2.5 font-medium">
                      {document.file_name ?? "Untitled file"}
                    </td>
                    <td className="text-ink-muted px-3 py-2.5">
                      {document.project_title}
                    </td>
                    <td className="text-ink-muted px-3 py-2.5">
                      {DOCUMENT_TYPE_LABELS[document.type]}
                    </td>
                    <td className="py-2.5 pr-3">
                      <DocumentRowMenu document={document} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
