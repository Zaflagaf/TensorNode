import { toast, type ExternalToast } from "sonner";

interface CustomToastProps extends ExternalToast {
  title: string; // texte principal
  description?: string; // texte secondaire optionnel
}

export function toastError({ title, description, ...props }: CustomToastProps) {
  toast.error(title, {
    ...props,
    description,
    className: "bg-hue-50/50! border-none! backdrop-blur-xs",
    style: {
        ...(props.style ?? {}),
    },
  });
}

export function toastSuccess({
  title,
  description,
  ...props
}: CustomToastProps) {
  toast.success(title, {
    ...props,
    description,
    className: "bg-hue-150/50! border-none! backdrop-blur-xs",
    style: {
      ...(props.style ?? {}),
    },
  });
}

export function toastWarning({
  title,
  description,
  ...props
}: CustomToastProps) {
  toast.warning(title, {
    ...props,
    description,
    className: "bg-hue-100/50! border-none! backdrop-blur-xs",
    style: {
      ...(props.style ?? {}),
    },
  });
}

export function toastInfo({ title, description, ...props }: CustomToastProps) {
  toast.info(title, {
    ...props,
    description,
    className: "bg-muted/50! border-none! backdrop-blur-xs",
    style: {
      ...(props.style ?? {}),
    },
  });
}
