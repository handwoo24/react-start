import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useIntl } from "react-intl";
import { SearchInput } from "~/components/SearchInput";
import SearchIcon from "~/icons/search.svg?react";
import RightIcon from "~/icons/right.svg?react";
import { Address, searchAddress } from "~/utils/address";
import { registerFn } from "~/server/address";
import { useCallback } from "react";

export const Route = createFileRoute("/address")({
  component: RouteComponent,
  async loader(ctx) {
    const searchParams = new URLSearchParams(ctx.location.search);
    const query = searchParams.get("query");
    if (typeof query !== "string") {
      return { items: [] };
    }
    const items = await searchAddress(query);
    return { items, query };
  },
});

function RouteComponent() {
  const { items, query } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const intl = useIntl();

  const register = useServerFn(registerFn);

  const handleClickRegister = useCallback(
    (item: Address) => async () => {
      const confirmed = confirm(
        intl.formatMessage(
          { id: "register-address" },
          { address: item.roadAddress }
        )
      );

      if (confirmed) {
        await register({ data: item });
        navigate({ to: "/" });
      }
    },
    [intl, navigate, register]
  );

  return (
    <main className="min-h-screen mx-auto max-w-5xl p-4 md:p-10">
      <form method="GET" className="w-full join">
        <SearchInput
          name="query"
          required
          className="join-item input w-full"
          autoFocus
          placeholder={intl.formatMessage({ id: "placeholder-address" })}
          defaultValue={query}
        />
        <button type="submit" className="btn btn-square btn-soft join-item">
          <SearchIcon className="size-6" />
        </button>
      </form>
      <div className="divider opacity-0" />
      <div className="list">
        {items.map((item, index) => (
          <button
            onClick={handleClickRegister(item)}
            key={index}
            className="list-row hover:bg-base-content/5 cursor-pointer text-start"
          >
            <div />
            <p className="self-center tracking-wide">{item.roadAddress}</p>
            <p className="list-col-wrap caption">{item.jibunAddress}</p>
            <RightIcon className="size-6" />
          </button>
        ))}
      </div>
    </main>
  );
}
