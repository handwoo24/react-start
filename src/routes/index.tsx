import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FormattedMessage } from "react-intl";
import { loginFn } from "~/server/auth";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const login = useServerFn(loginFn);

  return (
    <div className="p-2">
      <h3>
        <FormattedMessage id="title" />
        <button onClick={() => login()}>login</button>
      </h3>
    </div>
  );
}
