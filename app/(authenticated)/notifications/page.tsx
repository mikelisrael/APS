import { SuspenseLoader } from "@/components/ui/loaders";
import { ICON_MAP, NotificationType } from "./icon-map";
import notifications from "./notifications.json";

interface Notification {
  type: NotificationType;
  read: boolean;
  title: string;
  message: string;
}

const Notifications = () => {
  return (
    <SuspenseLoader fullPage>
      <h1 className="page-title">Notifications</h1>

      <ul className="mt-8 divide-y">
        {notifications.map((notification, index) => {
          const { type, title, message } = notification as Notification;
          const { icon: Icon, color } = ICON_MAP[type];

          return (
            <li
              key={index}
              className="flex cursor-pointer gap-5 px-5 py-4 hover:bg-muted"
            >
              <Icon className={`size-12 shrink-0 ${color}`} />
              <div className="flex-grow">
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm">{message}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </SuspenseLoader>
  );
};

export default Notifications;
