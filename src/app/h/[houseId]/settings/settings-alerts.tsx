"use client";

import { useQueryState } from "nuqs";
import { useEffect } from "react";

interface SettingsAlertsProps {
  flashError?: string | null;
}

export function SettingsAlerts({ flashError }: SettingsAlertsProps) {
  const [error, setError] = useQueryState("error", {
    defaultValue: "",
    shallow: true,
  });

  useEffect(() => {
    if (!flashError) return;
    // eslint-disable-next-line no-alert
    alert(flashError);
  }, [flashError]);

  useEffect(() => {
    if (!error) return;
    // eslint-disable-next-line no-alert
    alert(error);
    void setError(null);
  }, [error, setError]);

  return null;
}
