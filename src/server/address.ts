import { createServerFn } from "@tanstack/react-start";
import { addAddress, deleteAddress } from "~/database/address";
import { Address } from "~/model/address";

export const deleteFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async (ctx) => {
    const id = ctx.data;

    await deleteAddress(id);
  });

export const registerFn = createServerFn({ method: "POST" })
  .validator((address: Omit<Address, "id">) => address)
  .handler(async (ctx) => {
    await addAddress(ctx.data);
  });
