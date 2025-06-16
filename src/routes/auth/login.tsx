import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FormattedMessage } from "react-intl";
import { loginFn } from "~/server/auth";

export const Route = createFileRoute("/auth/login")({
  component: Login,
});

function Login() {
  const login = useServerFn(loginFn);

  return (
    <main>
      <button className="btn" onClick={() => login()}>
        <FormattedMessage id="sign-in-with-google" />
      </button>
    </main>
  );
}
