"use client";

import { useNavigate, useRouter } from "@tanstack/react-router";
import { ButtonHTMLAttributes, useCallback, useTransition } from "react";

export interface ConfirmButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  action: (geolocationPosition: GeolocationPosition) => Promise<string | void>;
  message: string;
  to?: string;
}

export const ConfirmButton = ({
  action,
  message,
  to,
  ...props
}: ConfirmButtonProps) => {
  const [isPending, start] = useTransition();

  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    return start(async () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const confirmed = confirm(message);
          if (!confirmed) {
            return;
          }

          const result = await action(position.toJSON());
          if (result) {
            alert(result);
          }

          if (to) {
            navigate({ to });
          }
        },
        (error) => alert(error)
      );
    });
  }, [action, message, to, navigate]);

  return <button onClick={handleClick} disabled={isPending} {...props} />;
};
