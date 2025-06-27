import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FormattedMessage, useIntl } from "react-intl";
import { loginFn } from "~/server/auth";
import GoogleIcon from "~/icons/google.svg?react";
import { useCallback } from "react";

export const Route = createFileRoute("/auth/login")({
  component: Login,
});

function Login() {
  const login = useServerFn(loginFn);

  const intl = useIntl();

  const handleClickLogin = useCallback(() => login(), [login]);

  return (
    <main className="hero min-h-screen">
      <div className="hero-content text-center">
        <div>
          <p className="py-6">hello</p>
          <button
            type="submit"
            className="btn btn-soft"
            onClick={handleClickLogin}
          >
            <GoogleIcon className="size-6" />
            구글로 로그인
          </button>
        </div>
      </div>
    </main>
  );
}
