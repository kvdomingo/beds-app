import { createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable, type DataTableFeatures } from "#/components/data-table";
import { Tooltip, TooltipContent, TooltipTrigger } from "#/components/ui/tooltip";
import { DeleteWardDialog, UpsertWardDialog } from "#/components/ward-dialogs";
import { $api } from "#/lib/api";
import type { components } from "#/lib/api/generated/types";

export const Route = createFileRoute("/")({ component: Page });

const columnHelper = createColumnHelper<
  DataTableFeatures,
  components["schemas"]["ListWardsCountsRow"]
>();

const columns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: "Ward Name",
  }),
  columnHelper.accessor("bed_capacity", {
    header: "Bed Capacity",
  }),
  columnHelper.accessor("patients_admitted", {
    header: "Patients Admitted",
  }),
  columnHelper.display({
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <UpsertWardDialog isEditing ward={row.original} />
          </TooltipTrigger>
          <TooltipContent>Edit</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <DeleteWardDialog ward={row.original} />
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </div>
    ),
  }),
]);

function Page() {
  const { queryClient } = Route.useRouteContext();
  const { data: wards = [] } = $api.useQuery(
    "get",
    "/wards",
    undefined,
    undefined,
    queryClient,
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Wards</h1>
        <UpsertWardDialog />
      </div>
      <DataTable columns={columns} data={wards} />
    </div>
  );
}
