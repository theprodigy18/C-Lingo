import Swal, { type SweetAlertIcon } from "sweetalert2";

// ─────────────────────────────────────────────
// Modal — blocking, centered, use case: success
// with action button (e.g. redirect after login)
// ─────────────────────────────────────────────
interface ModalOptions {
  title: string;
  text?: string;
  icon?: SweetAlertIcon;
  confirmText?: string;
  onConfirm?: () => void;
}

export function showModal({
  title,
  text,
  icon = "success",
  confirmText = "Continue",
  onConfirm,
}: ModalOptions) {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: confirmText,
    allowOutsideClick: false,
    allowEscapeKey: false,
    buttonsStyling: false,
    customClass: {
      popup: "!rounded-2xl !px-8 !py-8 !shadow-2xl",
      title: "!text-[#1a2e4a] !font-bold !text-2xl !font-[Poppins]",
      htmlContainer: "!text-slate-500 !text-sm",
      confirmButton:
        "!bg-[#1a2e4a] !text-white !font-semibold !text-sm !px-8 !py-3 !rounded-full hover:!bg-[#243d60] !transition-all",
    },
  }).then((result) => {
    if (result.isConfirmed && onConfirm) onConfirm();
  });
}

// ─────────────────────────────────────────────
// Loading modal — blocking, centered, use case: pending requests
// with no action button until the request resolves
// ─────────────────────────────────────────────
interface LoadingModalOptions {
  title?: string;
  text?: string;
}

export function showLoadingModal({
  title = "Please wait",
  text = "Processing your request...",
}: LoadingModalOptions = {}) {
  return Swal.fire({
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    buttonsStyling: false,
    customClass: {
      popup: "!rounded-2xl !px-8 !py-8 !shadow-2xl",
      title: "!text-[#1a2e4a] !font-bold !text-2xl !font-[Poppins]",
      htmlContainer: "!text-slate-500 !text-sm",
      loader: "!border-[#00c8f0]",
    },
    didOpen: () => {
      Swal.showLoading();
    },
  });
}

export function hideLoadingModal() {
  Swal.close();
}

// ─────────────────────────────────────────────
// Toast — non-blocking, corner pop-up
// use case: errors, warnings, info snippets
// ─────────────────────────────────────────────
type ToastType = "success" | "error" | "warning" | "info";

const ToastBase = Swal.mixin({
  toast: true,
  position: "bottom-end",
  showConfirmButton: false,
  timer: 3500,
  timerProgressBar: true,
  buttonsStyling: false,
  customClass: {
    popup: "!rounded-xl !text-sm !font-[Poppins] !shadow-lg !px-4 !py-3",
    title: "!text-sm !font-medium",
    timerProgressBar: "!bg-[#00c8f0]",
  },
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

export function showToast(type: ToastType, message: string) {
  return ToastBase.fire({
    icon: type,
    title: message,
  });
}

// ─────────────────────────────────────────────
// Convenience shorthands
// ─────────────────────────────────────────────
export const toast = {
  success: (msg: string) => showToast("success", msg),
  error: (msg: string) => showToast("error", msg),
  warning: (msg: string) => showToast("warning", msg),
  info: (msg: string) => showToast("info", msg),
};
