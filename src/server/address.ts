import { createServerFn } from "@tanstack/react-start";
import { deleteAddress } from "~/database/address";

export const deleteFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async (ctx) => {
    const id = ctx.data;

    await deleteAddress(id);
  });
