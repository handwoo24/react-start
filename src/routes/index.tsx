import { createFileRoute } from "@tanstack/react-router";
import { FormattedMessage } from "react-intl";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="p-2">
      <h3>
        <FormattedMessage id="title" />
      </h3>
    </div>
  );
}
