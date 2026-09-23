import { useForm, useSelector } from "@tanstack/react-form";
import { getRouteApi } from "@tanstack/react-router";
import { PencilIcon, PlusIcon, SquareArrowRightExitIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { $api } from "#/lib/api";
import type { components } from "#/lib/api/generated/types";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Spinner } from "./ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const FormSchema = z.object({
  name: z.string().nonempty({ error: "This field is required" }),
  ward_id: z.ulid({ error: "This field is required" }),
  bed_id: z.ulid({ error: "This field is required" }),
}) satisfies z.ZodType<components["schemas"]["Body_check_in_patient_patients_post"]>;

const Route = getRouteApi("/patients");

export function UpsertPatientDialog(
  props:
    | {
        isEditing: false;
      }
    | {
        isEditing: true;
        patient: components["schemas"]["ListPatientsRow"];
      },
) {
  const [isOpen, setIsOpen] = useState(false);

  const { queryClient } = Route.useRouteContext();
  const { queryKey: listPatientsQueryKey } = $api.queryOptions(
    "get",
    "/patients",
    undefined,
    undefined,
  );

  const { data: wards = [], isLoading: isWardsLoading } = $api.useQuery(
    "get",
    "/wards",
    undefined,
    undefined,
    queryClient,
  );

  const { mutateAsync: createPatient, isPending: isCreatePending } = $api.useMutation(
    "post",
    "/patients",
    undefined,
    queryClient,
  );

  const { mutateAsync: updatePatient, isPending: isUpdatePending } = $api.useMutation(
    "put",
    "/patients/{id}",
    undefined,
    queryClient,
  );

  const isPending = isCreatePending || isUpdatePending;

  const form = useForm({
    defaultValues: {
      name: props.isEditing ? props.patient.name : "",
      ward_id: props.isEditing ? props.patient.ward_id! : "",
      bed_id: props.isEditing ? props.patient.bed_id! : "",
    },
    validators: {
      onSubmit: FormSchema,
    },
    onSubmit: async ({ value: { name, bed_id } }) => {
      if (props.isEditing) {
        await updatePatient(
          {
            params: {
              path: { id: props.patient.id },
            },
            body: { bed_id },
          },
          {
            onSuccess: (data) => {
              queryClient.invalidateQueries({ queryKey: listPatientsQueryKey });
              queryClient.invalidateQueries({ queryKey: ["get", "/wards/{id}/beds"] });
              toast.success(`Patient ${data.name} updated successfully!`);
              handleOpenChange(false);
            },
          },
        );
      } else {
        await createPatient(
          {
            body: { name, bed_id },
          },
          {
            onSuccess: (data) => {
              queryClient.invalidateQueries({ queryKey: listPatientsQueryKey });
              queryClient.invalidateQueries({ queryKey: ["get", "/wards/{id}/beds"] });
              toast.success(`Patient ${data.name} admitted successfully!`);
              handleOpenChange(false);
            },
          },
        );
      }
    },
  });

  const wardId = useSelector(form.store, (state) => state.values.ward_id);

  const { data: beds = [], isLoading: isBedsLoading } = $api.useQuery(
    "get",
    "/wards/{id}/beds",
    {
      params: {
        path: { id: wardId },
      },
    },
    {
      enabled: !!wardId,
    },
    queryClient,
  );

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      form.reset();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        {props.isEditing ? (
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost">
                <PencilIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
        ) : (
          <Button>
            <PlusIcon />
            Admit Patient
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <DialogHeader>
            <DialogTitle>
              {props.isEditing ? (
                <>
                  Edit patient <b>{props.patient.name}</b>
                </>
              ) : (
                "Admit patient"
              )}
            </DialogTitle>
          </DialogHeader>

          <FieldGroup>
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
            <form.Field
              name="ward_id"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Ward</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(v) => {
                        field.handleChange(v);
                        form.setFieldValue("bed_id", "");
                      }}
                      disabled={isWardsLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isWardsLoading && <Spinner />} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {wards.map((ward) => (
                            <SelectItem key={ward.id} value={ward.id}>
                              {ward.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
            <form.Field
              name="bed_id"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Bed</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(v) => field.handleChange(v)}
                      disabled={isBedsLoading || !wardId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isBedsLoading && <Spinner />} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {beds.map((bed) => (
                            <SelectItem key={bed.id} value={bed.id}>
                              {bed.id}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

UpsertPatientDialog.defaultProps = {
  isEditing: false,
};

export function DischargePatientDialog({
  patient,
}: {
  patient: components["schemas"]["ListPatientsRow"];
}) {
  const [isOpen, setIsOpen] = useState(false);

  const { queryClient } = Route.useRouteContext();
  const { queryKey: listPatientsQueryKey } = $api.queryOptions(
    "get",
    "/patients",
    undefined,
    undefined,
  );

  const { mutateAsync: dischargePatient, isPending } = $api.useMutation(
    "delete",
    "/patients/{id}",
    undefined,
    queryClient,
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" className="group">
              <SquareArrowRightExitIcon className="group-hover:stroke-destructive-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Discharge</TooltipContent>
        </Tooltip>
      </DialogTrigger>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            dischargePatient(
              {
                params: {
                  path: { id: patient.id },
                },
              },
              {
                onSuccess: (data) => {
                  queryClient.invalidateQueries({ queryKey: listPatientsQueryKey });
                  queryClient.invalidateQueries({
                    queryKey: ["get", "/wards/{id}/beds"],
                  });
                  toast.success(`Patient ${data.name} discharged successfully!`);
                  setIsOpen(false);
                },
              },
            );
          }}
          className="space-y-6"
        >
          <DialogHeader>
            <DialogTitle>
              Discharge patient <b>{patient.name}</b>?
            </DialogTitle>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending && <Spinner />}
              Discharge
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
