import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import dayjs from "dayjs";
import { useIntl } from "react-intl";
import { NotFound } from "src/components/NotFound";
import { UserErrorComponent } from "src/components/UserError";
import { useAuthSession } from "~/auth/session";
import { getUserAttendanceEvents } from "~/database/attendanceEvent";
import { getUser } from "~/database/user";
import CheckIcon from "~/icons/check.svg?react";
import EditIcon from "~/icons/edit.svg?react";
import DeleteIcon from "~/icons/delete.svg?react";
import { AttendanceEvent, AttendanceEventType } from "~/model/attendanceEvents";
import { getDaysByWeeks } from "~/utils/date";
import { useCallback } from "react";
import { disableFn, updateNameFn } from "~/server/user";
import { acknowledgeFn, deleteFn } from "~/server/attendance";
import { User } from "~/model/user";
import { useModal } from "~/components/Modal";

const loaderFn = createServerFn({ method: "POST" })
  .validator((uid: string) => uid)
  .handler(async (ctx) => {
    const uid = ctx.data;
    const session = await useAuthSession();
    if (!session.data.uid) {
      throw redirect({ to: "/auth/login" });
    }

    let isAdmin = false;
    const user = await getUser(uid);
    if (!user) {
      throw new Error("Not found user");
    } else if (uid !== session.data.uid) {
      const user = await getUser(session.data.uid);
      isAdmin = !!user?.admin;
    }

    const now = dayjs();
    const startOfMonth = now.startOf("month").valueOf();
    const endOfMonth = now.endOf("month").valueOf();

    const attendanceEvents = await getUserAttendanceEvents(
      uid,
      startOfMonth,
      endOfMonth
    );

    const weeks = getDaysByWeeks();

    return { isAdmin, user, attendanceEvents, weeks };
  });

export const Route = createFileRoute("/users/$uid")({
  loader: ({ params: { uid } }) => {
    return loaderFn({ data: uid });
  },
  errorComponent: UserErrorComponent,
  component: UserComponent,
  notFoundComponent: () => {
    return <NotFound>User not found</NotFound>;
  },
});

function UserComponent() {
  const { attendanceEvents, isAdmin, user, weeks } = Route.useLoaderData();

  const router = useRouter();
  const modal = useModal();

  const intl = useIntl();
  const disableUser = useServerFn(disableFn);
  const deleteEvent = useServerFn(deleteFn);
  const updateName = useServerFn(updateNameFn);
  const acknowledgeAttendance = useServerFn(acknowledgeFn);

  const hasAttendance = useCallback(
    (date: number) => {
      if (user.admin) {
        return -1;
      }

      const offset = dayjs().date(date);
      const start = offset.startOf("day");
      const end = offset.endOf("day");

      const targets = attendanceEvents.filter(
        (e) => e.timestamp <= end.valueOf() && e.timestamp >= start.valueOf()
      );

      return targets.length > 0 ? Math.max(...targets.map((e) => e.type)) : -1;
    },
    [attendanceEvents]
  );

  const handleClickDisableUser = useCallback(
    (id: string) => async () => {
      await disableUser({ data: id });
      router.invalidate();
    },
    [router, disableUser]
  );

  const handleClickDeleteEvent = useCallback(
    (e: AttendanceEvent) => async () => {
      const datetime = dayjs(e.timestamp).format("YYYY-MM-DD HH:mm");
      const eventType =
        e.type === AttendanceEventType.checkIn
          ? intl.formatMessage({ id: "check-in" })
          : intl.formatMessage({ id: "check-out" });

      const confirmed = confirm(
        intl.formatMessage(
          { id: "confirm-delete-event" },
          { datetime, type: eventType }
        )
      );

      if (confirmed) {
        await deleteEvent({ data: e.id });
        router.invalidate();
      }
    },
    [router, deleteEvent]
  );

  const handleClickEditName = useCallback(
    (user: User) => () => {
      const action = async (formData: FormData) => {
        const name = formData.get("name");
        if (typeof name !== "string") {
          alert(intl.formatMessage({ id: "hint-name" }));
          return;
        } else if (user.name === name) {
          return;
        }

        await updateName({ data: { uid: user.id, name } });
        modal.close();
        router.invalidate();
      };

      modal.open(
        <form className="modal-box" action={action}>
          <h3>{intl.formatMessage({ id: "update-name" })}</h3>
          <input
            name="name"
            defaultValue={user.name}
            className="input w-full my-4 validator"
            minLength={2}
            maxLength={10}
            required
          />
          <small className="validator-hint">
            {intl.formatMessage({ id: "hint-name" })}
          </small>
          <div className="modal-action">
            <input
              className="btn btn-soft btn-primary not-md:btn-block"
              type="submit"
            />
          </div>
        </form>
      );
    },
    [modal, updateName, intl, router]
  );

  const handleClickCalendarCell = useCallback(
    (date: number) => async () => {
      const action = async (formData: FormData) => {
        const params = Object.fromEntries(formData) as {
          time1: string;
          time2: string;
          notes: string;
          date: string;
        };

        const date = parseInt(params.date);

        if (isNaN(date)) {
          alert(intl.formatMessage({ id: "invalid-date" }));
          return;
        }

        const day = dayjs().date(date);

        const [h1, m1] = params.time1.split(":").map((v) => parseInt(v, 10));
        const [h2, m2] = params.time2.split(":").map((v) => parseInt(v, 10));

        const start = day.hour(h1).minute(m1).startOf("minute");
        const end = day.hour(h2).minute(m2).startOf("minute");
        const isAscending = start.isBefore(end);
        const checkInTimestamp = isAscending ? start.valueOf() : end.valueOf();
        const checkOutTimestamp = isAscending ? end.valueOf() : start.valueOf();

        navigator.geolocation.getCurrentPosition(async (pos) => {
          const { longitude, latitude } = pos.coords;
          await acknowledgeAttendance({
            data: {
              uid: user.id,
              x: longitude.toString(),
              y: latitude.toString(),
              notes: params.notes,
              checkInTimestamp,
              checkOutTimestamp,
            },
          });

          modal.close();
          router.invalidate();
        });
      };

      modal.open(
        <form className="modal-box" action={action}>
          <h3>{intl.formatMessage({ id: "acknowledgement" })}</h3>
          <div className="py-4">
            <input className="hidden" name="date" defaultValue={date} />
            <p className="caption pb-2 pt-4">
              {intl.formatMessage({ id: "check-in" })}
            </p>
            <input name="time1" className="input w-full" type="time" required />
            <p className="caption pb-2 pt-4">
              {intl.formatMessage({ id: "check-out" })}
            </p>
            <input name="time2" className="input w-full" type="time" required />
            <p className="caption pb-2 pt-4">
              {intl.formatMessage({ id: "notes" })}
            </p>
            <textarea name="notes" className="textarea w-full" />
          </div>
          <div className="modal-action">
            <input className="btn btn-primary not-md:btn-block" type="submit" />
          </div>
        </form>
      );
    },
    [modal, intl, router, acknowledgeAttendance]
  );

  return (
    <main className="min-h-screen mx-auto max-w-5xl p-4 md:p-10">
      <div className="card card-border border-base-content/5 w-full rounded-box">
        <div className="card-body px-4 my-auto">
          <div className="flex flex-row gap-2">
            <div className="indicator">
              {user.picture ? (
                <div className="avatar">
                  <div className="w-12 rounded-full">
                    <img src={user.picture} alt={user.name} />
                  </div>
                </div>
              ) : (
                <div className="avatar avatar-placeholder">
                  <div className="bg-neutral text-neutral-content w-12 rounded-full">
                    <span className="text-xl">{user.name.slice(0, 1)}</span>
                  </div>
                </div>
              )}

              {!!user.disabled ? (
                <div
                  className="inline-grid *:[grid-area:1/1] indicator-item tooltip"
                  data-tip={intl.formatMessage({ id: "disable" })}
                >
                  <div className="status status-error animate-ping" />
                  <div className="status status-error" />
                </div>
              ) : (
                <div
                  className="inline-grid *:[grid-area:1/1] indicator-item tooltip"
                  data-tip={intl.formatMessage({ id: "enable" })}
                >
                  <div className="status status-success animate-ping" />
                  <div className="status status-success" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center">
                <span className="font-semibold text-lg">{user.name}</span>
                {(!user.disabled || isAdmin) && (
                  <button
                    className="btn btn-sm btn-square btn-ghost"
                    onClick={handleClickEditName(user)}
                  >
                    <EditIcon className="size-4 opacity-60" />
                  </button>
                )}
              </div>
              <p className="text-sm text-base-content/60">{user.email}</p>
            </div>
          </div>

          <div className="card-actions justify-end">
            <form action={handleClickDisableUser(user.id)}>
              {user.disabled ? (
                <button type="submit" className="btn btn-success btn-soft">
                  {intl.formatMessage({ id: "enable" })}
                </button>
              ) : (
                <button type="submit" className="btn btn-error btn-soft">
                  {intl.formatMessage({ id: "disable" })}
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
      <div className="divider opacity-0" />

      <div className="border border-base-content/5 rounded-box">
        <p className="caption p-4 pb-2">
          {intl.formatMessage({ id: "attendance-status" })}
        </p>
        <table className="calendar md:text-xl">
          <thead>
            <tr>
              {Array.from({ length: 7 }, (_, i) => (
                <th key={i} data-sunday={i === 0} data-saturday={i === 6}>
                  {dayjs().day(i).format("dd")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, i) => (
              <tr key={i}>
                {week.map((date, i) => (
                  <td
                    key={i}
                    data-sunday={i === 0}
                    data-saturday={i === 6}
                    className="relative"
                  >
                    {date > 0 && hasAttendance(date) === 0 && (
                      <div className="mask mask-circle absolute-center rounded-full border-4 border-success size-6 md:size-8" />
                    )}
                    {date > 0 && hasAttendance(date) === 1 && (
                      <div className="flex items-center justify-center absolute-center mask mask-circle bg-success size-6 md:size-8">
                        <CheckIcon className="size-6" />
                      </div>
                    )}
                    <span>{date > 0 && date}</span>
                    {hasAttendance(date) === -1 && (
                      <button
                        className="calendar-cell-btn"
                        onClick={handleClickCalendarCell(date)}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divider opacity-0" />

      <div className="border border-base-content/5 rounded-box">
        <p className="caption p-4 pb-2">
          {intl.formatMessage({ id: "detail-history" })}
        </p>
        <table className="table table-fixed">
          <thead>
            <tr>
              <th>{intl.formatMessage({ id: "timestamp" })}</th>
              <th>{intl.formatMessage({ id: "type" })}</th>
              <th>{intl.formatMessage({ id: "notes" })}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {attendanceEvents.map((e) => {
              const datetime = dayjs(e.timestamp).format("YYYY-MM-DD HH:mm");
              const eventType =
                e.type === AttendanceEventType.checkIn
                  ? intl.formatMessage({ id: "check-in" })
                  : intl.formatMessage({ id: "check-out" });
              return (
                <tr key={e.id}>
                  <td>{datetime}</td>
                  <td>{eventType}</td>
                  <td className="text-xs">{e.notes}</td>
                  <th className="text-right">
                    <button
                      onClick={handleClickDeleteEvent(e)}
                      className="btn btn-error btn-ghost"
                    >
                      <DeleteIcon className="size-6" />
                    </button>
                  </th>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
