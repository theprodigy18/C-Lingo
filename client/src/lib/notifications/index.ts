import Swal, {
  type SweetAlertIcon,
  type SweetAlertOptions,
  type SweetAlertResult,
} from 'sweetalert2';

type NotificationVariant = Exclude<SweetAlertIcon, 'question'> | 'question';

type ToastOptions = {
  title: string;
  message?: string;
  variant?: NotificationVariant;
  timer?: number;
};

type ModalOptions = {
  title: string;
  message?: string;
  variant?: NotificationVariant;
  confirmText?: string;
  cancelText?: string;
};

type LoadingOptions = {
  title?: string;
  message?: string;
};

const baseCustomClass: SweetAlertOptions['customClass'] = {
  popup: 'clingo-swal-popup',
  title: 'clingo-swal-title',
  htmlContainer: 'clingo-swal-message',
  icon: 'clingo-swal-icon',
  confirmButton: 'clingo-swal-confirm',
  cancelButton: 'clingo-swal-cancel',
  actions: 'clingo-swal-actions',
  loader: 'clingo-swal-loader',
};

const toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2800,
  timerProgressBar: true,
  showClass: {
    popup: 'swal2-show clingo-swal-toast-show',
  },
  hideClass: {
    popup: 'swal2-hide clingo-swal-toast-hide',
  },
  customClass: {
    ...baseCustomClass,
    popup: 'clingo-swal-popup clingo-swal-toast',
  },
});

const fireToast = ({
  title,
  message,
  variant = 'success',
  timer = 2800,
}: ToastOptions) => {
  return toast.fire({
    icon: variant,
    title,
    text: message,
    timer,
  });
};

const fireModal = ({
  title,
  message,
  variant = 'info',
  confirmText = 'OK',
}: ModalOptions) => {
  return Swal.fire({
    icon: variant,
    title,
    text: message,
    confirmButtonText: confirmText,
    buttonsStyling: false,
    customClass: baseCustomClass,
  });
};

const fireConfirm = ({
  title,
  message,
  variant = 'question',
  confirmText = 'Yes',
  cancelText = 'Cancel',
}: ModalOptions): Promise<SweetAlertResult> => {
  return Swal.fire({
    icon: variant,
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    buttonsStyling: false,
    customClass: baseCustomClass,
  });
};

const showLoading = ({
  title = 'Loading',
  message = 'Please wait a moment...',
}: LoadingOptions = {}) => {
  return Swal.fire({
    title,
    text: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    buttonsStyling: false,
    customClass: baseCustomClass,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

export const notification = {
  toast: fireToast,
  modal: fireModal,
  confirm: fireConfirm,
  loading: showLoading,
  close: () => Swal.close(),
  success: (title: string, message?: string) =>
    fireToast({ title, message, variant: 'success' }),
  error: (title: string, message?: string) =>
    fireToast({ title, message, variant: 'error', timer: 3600 }),
  warning: (title: string, message?: string) =>
    fireToast({ title, message, variant: 'warning' }),
  info: (title: string, message?: string) =>
    fireToast({ title, message, variant: 'info' }),
};

export const useNotification = () => notification;
