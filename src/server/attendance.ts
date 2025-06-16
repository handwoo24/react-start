import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { getHeader } from "@tanstack/react-start/server";
import dayjs from "dayjs";
import { useAuthSession } from "~/auth/session";
import { getAddresses } from "~/database/address";
import { checkIn, checkOut, isCheckedIn } from "~/database/attendanceEvent";
import { getDistance } from "~/utils/address";
import { getUser } from "~/database/user";

export const attendFn = createServerFn({ method: "POST" })
  .validator((data: { x: string; y: string }) => data)
  .handler(async (ctx) => {
    const session = await useAuthSession();
    const uid = session.data.uid;
    if (!uid) {
      throw redirect({ to: "/auth/login" });
    }

    const userAgent = getHeader("User-Agent");
    const xff = getHeader("x-forwarded-for") || "";
    const ipAddress =
      xff.split(",")[0]?.trim() || getHeader("x-real-ip") || "0.0.0.0";

    const now = dayjs();
    const startOfDay = now.startOf("day").valueOf();
    const endOfDay = now.endOf("day").valueOf();

    const checkedIn = await isCheckedIn(uid, startOfDay, endOfDay);
    const addresses = await getAddresses();

    const location = addresses.find((item) => {
      const dis = getDistance(
        { latitude: parseFloat(ctx.data.y), longitude: parseFloat(ctx.data.x) },
        { longitude: parseFloat(item.x), latitude: parseFloat(item.y) }
      );
      return dis < 50;
    });

    if (!location) {
      return;
    }

    if (checkedIn) {
      await checkOut({
        ipAddress,
        userAgent,
        uid,
        x: ctx.data.x,
        y: ctx.data.y,
      });
    } else {
      await checkIn({
        ipAddress,
        userAgent,
        uid,
        x: ctx.data.x,
        y: ctx.data.y,
      });
    }
  });
