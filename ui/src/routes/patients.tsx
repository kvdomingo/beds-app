import { createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable, type DataTableFeatures } from "#/components/data-table";
import {
  DischargePatientDialog,
  UpsertPatientDialog,
} from "#/components/patient-dialogs";
import { Tooltip, TooltipContent, TooltipTrigger } from "#/components/ui/tooltip";
import { $api } from "#/lib/api";
import type { components } from "#/lib/api/generated/types";

export const Route = createFileRoute("/patients")({ component: Page });

const columnHelper = createColumnHelper<
  DataTableFeatures,
  components["schemas"]["ListPatientsRow"]
>();

const columns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "Patient ID",
  }),
  columnHelper.accessor("admitted_at", {
    header: "Admitted at",
    cell: ({ getValue }) => {
      const value = new Date(getValue());
      return Intl.DateTimeFormat("en-PH", {
        hour12: true,
        dateStyle: "long",
        timeStyle: "short",
      }).format(value);
    },
  }),
  columnHelper.accessor("ward_name", {
    header: "Ward",
  }),
  columnHelper.accessor("bed_id", {
    header: "Bed ID",
  }),
  columnHelper.display({
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <UpsertPatientDialog isEditing patient={row.original} />
          </TooltipTrigger>
          <TooltipContent>Edit</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <DischargePatientDialog patient={row.original} />
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </div>
    ),
  }),
]);

function Page() {
  const { queryClient } = Route.useRouteContext();
  const { data: patients = [] } = $api.useQuery(
    "get",
    "/patients",
    undefined,
    undefined,
    queryClient,
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Patients</h1>
        <UpsertPatientDialog />
      </div>
      <DataTable columns={columns} data={patients} />
    </div>
  );
}
