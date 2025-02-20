import React, { useEffect } from "react";
import { BellRing, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  getNotifications,
  setAllNotificationsRead,
  updateUserNotificationsStatus,
} from "../services/private";
import useFetchAndLoad from "../hooks/useFetchAndLoad";

import { formatNotification } from "../utils/formatNotification";
import { daysUntilDateTime } from "../utils/daysUntilDate";

type CardProps = React.ComponentProps<typeof Card>;

export function NotificationMenu({ className, ...props }: CardProps) {
  const { loading, callEndpoint } = useFetchAndLoad();
  const [notifications, setNotifications] = React.useState([]);
  const [sendNotifications, setSendNotifications] = React.useState(null);
  useEffect(() => {
    const fetchNotifications = async () => {
      const response = await callEndpoint(getNotifications());
      if (response && !response.error) {
        setNotifications(response.data.data);
        setSendNotifications(response.data.sendNotifications);
      }
    };

    fetchNotifications();
  }, []);

  const handleDeleteNotifications = async () => {
    const response = await callEndpoint(setAllNotificationsRead());

    if (!response.error) {
      setNotifications([]);
    }
  };
  const handleUpdateUserNotificationsStatus = async (value) => {
    const response = await callEndpoint(updateUserNotificationsStatus(value));

    if (!response.error) {
      setSendNotifications(value);
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Notificaciones</CardTitle>
        <CardDescription>
          Tenes {notifications.length} mensajes no leidos.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className=" flex items-center space-x-4 rounded-md border p-4">
          <BellRing />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              Notificaciones push
            </p>
            <p className="text-sm text-muted-foreground">
              Mandar notificaciones a dispositivos.
            </p>
          </div>
          <Switch
            checked={sendNotifications}
            disabled={loading || sendNotifications === null}
            onCheckedChange={handleUpdateUserNotificationsStatus}
          />
        </div>
        <div>
          {notifications
            .sort(
              (a, b) =>
                new Date(b.expiracy).getTime() - new Date(a.expiracy).getTime()
            )
            .slice(0, 3)
            .map((notification, index) => (
              <div
                key={index}
                className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
              >
                <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {formatNotification(notification)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {daysUntilDateTime(notification.expiracy)}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleDeleteNotifications}>
          <Check /> Marcar todas como leidas
        </Button>
      </CardFooter>
    </>
  );
}
