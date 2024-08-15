import notifier from "node-notifier";
import { NotificationOptions } from "./types";

export function sendTaskCompletionNotification(options: NotificationOptions) {
  const { taskName, status, message } = options;

  notifier.notify({
    title: `Task "${taskName}" - ${status}`,
    message: message || `The task "${taskName}" has been ${status}.`,
    sound: true,
    wait: true,
  });
}
