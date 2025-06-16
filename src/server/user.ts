import { createServerFn } from "@tanstack/react-start";
import { getUser, updateUser } from "~/database/user";

export const disableFn = createServerFn({ method: "POST" })
  .validator((uid: string) => uid)
  .handler(async (ctx) => {
    const user = await getUser(ctx.data);
    if (!user) {
      throw new Error("Not found user");
    }

    await updateUser(ctx.data, { disabled: !user.disabled });
  });

export const updateNameFn = createServerFn({ method: "POST" })
  .validator((data: { uid: string; name: string }) => data)
  .handler(async (ctx) => {
    await updateUser(ctx.data.uid, { name: ctx.data.name });
  });
