type ToastType = "success" | "error" | "info";
type ToastFn = (msg: string, type?: ToastType, sub?: string) => void;

let _emit: ToastFn = () => {};

export const toast = {
  success: (msg: string, sub?: string) => _emit(msg, "success", sub),
  error:   (msg: string, sub?: string) => _emit(msg, "error",   sub),
  info:    (msg: string, sub?: string) => _emit(msg, "info",    sub),
  _register: (fn: ToastFn) => { _emit = fn; },
};
