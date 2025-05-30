import {toast} from "sonner";

export const handleSuccess = (msg: string, desc?: string) => {
    toast.success(msg, {description: desc});
};

export const handleError = (msg: string, desc?: string) => {
    toast.error(msg, {description: desc});
};