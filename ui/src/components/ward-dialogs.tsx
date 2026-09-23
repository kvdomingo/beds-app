import { useForm } from "@tanstack/react-form";
import { getRouteApi } from "@tanstack/react-router";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Spinner } from "./ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const FormSchema = z.object({
  name: z.string().nonempty({ error: "This field is required" }),
  bed_capacity: z.number().nonnegative({ error: "Bed capacity cannot be negative" }),
}) satisfies z.ZodType<components["schemas"]["Body_create_ward_wards_post"]>;

const Route = getRouteApi("/");

export function UpsertWardDialog(
  props:
    | {
        isEditing: false;
      }
    | {
        isEditing: true;
        ward: components["schemas"]["ListWardsCountsRow"];
      },
) {
  const [isOpen, setIsOpen] = useState(false);

  const { queryClient } = Route.useRouteContext();
  const { queryKey: listWardsQueryKey } = $api.queryOptions(
    "get",
    "/wards",
    undefined,
    undefined,
  );

  const { mutateAsync: createWard, isPending: isCreatePending } = $api.useMutation(
    "post",
    "/wards",
    undefined,
    queryClient,
  );

  const { mutateAsync: updateWard, isPending: isUpdatePending } = $api.useMutation(
    "put",
    "/wards/{id}",
    undefined,
    queryClient,
  );

  const isPending = isCreatePending || isUpdatePending;

  const form = useForm({
    defaultValues: {
      name: props.isEditing ? props.ward.name : "",
      bed_capacity: props.isEditing ? props.ward.bed_capacity : 0,
    },
    validators: {
      onSubmit: FormSchema,
    },
    onSubmit: async ({ value: { name, bed_capacity } }) => {
      if (props.isEditing) {
        await updateWard(
          {
            params: {
              path: { id: props.ward.id },
            },
            body: { name, bed_capacity },
          },
          {
            onSuccess: (data) => {
              queryClient.invalidateQueries({ queryKey: listWardsQueryKey });
              queryClient.invalidateQueries({ queryKey: ["get", "/wards/{id}/beds"] });
              toast.success(`Ward ${data.name} updated successfully!`);
              handleOpenChange(false);
            },
          },
        );
      } else {
        await createWard(
          {
            body: { name, bed_capacity },
          },
          {
            onSuccess: (data) => {
              queryClient.invalidateQueries({ queryKey: listWardsQueryKey });
              queryClient.invalidateQueries({ queryKey: ["get", "/wards/{id}/beds"] });
              toast.success(`Ward ${data.name} created successfully!`);
              handleOpenChange(false);
            },
          },
        );
      }
    },
  });

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      form.reset();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant={props.isEditing ? "ghost" : undefined}>
              {props.isEditing ? (
                <PencilIcon />
              ) : (
                <>
                  <PlusIcon />
                  Create Ward
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit</TooltipContent>
        </Tooltip>
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
                  Edit ward <b>{props.ward.name}</b>
                </>
              ) : (
                "Create ward"
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
              name="bed_capacity"
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
                      type="number"
                      min={0}
                      formNoValidate
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(Number.parseInt(e.target.value, 10))
                      }
                      aria-invalid={isInvalid}
                    />
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

UpsertWardDialog.defaultProps = {
  isEditing: false,
};

export function DeleteWardDialog({ ward }: { ward: components["schemas"]["Ward"] }) {
  const [isOpen, setIsOpen] = useState(false);

  const { queryClient } = Route.useRouteContext();
  const { queryKey: listWardsQueryKey } = $api.queryOptions(
    "get",
    "/wards",
    undefined,
    undefined,
  );

  const { mutateAsync: deleteWard, isPending } = $api.useMutation(
    "delete",
    "/wards/{id}",
    undefined,
    queryClient,
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" className="group">
              <Trash2Icon className="group-hover:stroke-destructive-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </DialogTrigger>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            deleteWard(
              {
                params: {
                  path: { id: ward.id },
                },
              },
              {
                onSuccess: (data) => {
                  queryClient.invalidateQueries({ queryKey: listWardsQueryKey });
                  toast.success(`Ward ${data.name} deleted successfully!`);
                  setIsOpen(false);
                },
              },
            );
          }}
          className="space-y-6"
        >
          <DialogHeader>
            <DialogTitle>
              Delete ward <b>{ward.name}</b>?
            </DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending && <Spinner />}
              Delete
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
