import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { useIntl } from "react-intl";
import { Avatar } from "~/components/Avatar";
import { logoutFn } from "~/server/auth";
import CrownIcon from "~/icons/crown.svg?react";
import EditIcon from "~/icons/edit.svg?react";
import DeleteIcon from "~/icons/delete.svg?react";
import AddIcon from "~/icons/add.svg?react";
import DownloadIcon from "~/icons/download.svg?react";
import CheckIcon from "~/icons/check.svg?react";
import RightIcon from "~/icons/right.svg?react";
import dayjs from "dayjs";
import { useAuthSession } from "~/auth/session";
import {
  getAttendanceEvents,
  getUserAttendanceEvents,
  isCheckedIn,
  isCheckedOut,
} from "~/database/attendanceEvent";
import { getUser, getUsers } from "~/database/user";
import { getAddresses } from "~/database/address";
import { getDaysByWeeks } from "~/utils/date";
import { AttendanceEventType } from "~/model/attendanceEvents";
import { useCallback, useMemo } from "react";
import { attendFn } from "~/server/attendance";
import { deleteFn } from "~/server/address";
import { CsvDownloadButton } from "~/components/CsvDownloadButton";
import { User } from "~/model/user";
import { useModal } from "~/components/Modal";
import { updateNameFn } from "~/server/user";
import { Address } from "~/model/address";

const loaderFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useAuthSession();
  const uid = session.data.uid;

  if (!uid) {
    throw redirect({ to: "/auth/login" });
  }

  const user = await getUser(uid);
  if (!user) {
    throw new Error("Not found user");
  }

  const now = dayjs();
  const startOfMonth = now.startOf("month").valueOf();
  const endOfMonth = now.endOf("month").valueOf();
  const startOfDay = now.startOf("day").valueOf();
  const endOfDay = now.endOf("day").valueOf();

  const attendanceEvents = user.admin
    ? await getAttendanceEvents(startOfMonth, endOfMonth)
    : await getUserAttendanceEvents(user.id, startOfMonth, endOfMonth);

  const users = user.admin ? await getUsers() : [];

  const addresses = await getAddresses();

  const checkedIn = user.admin
    ? false
    : await isCheckedIn(user.id, startOfDay, endOfDay);
  const checkedOut = user.admin
    ? false
    : await isCheckedOut(user.id, startOfDay, endOfDay);

  const weeks = getDaysByWeeks();

  return {
    user,
    attendanceEvents,
    users,
    addresses,
    checkedIn,
    checkedOut,
    weeks,
  };
});

export const Route = createFileRoute("/")({
  component: Home,
  loader() {
    return loaderFn();
  },
});

function Home() {
  const {
    user,
    attendanceEvents,
    users,
    addresses,
    checkedIn,
    checkedOut,
    weeks,
  } = Route.useLoaderData();

  const router = useRouter();

  const logout = useServerFn(logoutFn);
  const attend = useServerFn(attendFn);
  const deleteAddress = useServerFn(deleteFn);
  const updateName = useServerFn(updateNameFn);

  const modal = useModal();

  const intl = useIntl();

  const isDisabled = !user.admin && user.disabled;

  const normalUsers = useMemo(
    () => users.filter((user) => !user.admin && !user.disabled),
    []
  );

  const getAttendanceRatio = (date: number) => {
    if (!normalUsers.length) {
      return 0;
    }

    const offset = dayjs().date(date);
    const start = offset.startOf("day");
    const end = offset.endOf("day");

    const targets = attendanceEvents.filter(
      (e) =>
        e.type === AttendanceEventType.checkOut &&
        e.timestamp <= end.valueOf() &&
        e.timestamp >= start.valueOf()
    );

    return Math.min(
      100,
      Math.round((targets.length / normalUsers.length) * 100)
    );
  };

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

  const sheetData = useMemo(() => {
    const userMap = users.reduce(
      (acc, cur) => {
        acc[cur.id] = cur;
        return acc;
      },
      {} as Record<string, User>
    );

    return user.admin
      ? attendanceEvents.map((e) => {
          const user = userMap[e.uid];
          return {
            [intl.formatMessage({ id: "user-name" })]: user.name,
            [intl.formatMessage({ id: "user-email" })]: user.email,
            [intl.formatMessage({ id: "timestamp" })]: dayjs(
              e.timestamp
            ).format("YYYY-MM-DD HH:mm"),
            [intl.formatMessage({ id: "type" })]:
              e.type === AttendanceEventType.checkIn
                ? intl.formatMessage({ id: "check-in" })
                : intl.formatMessage({ id: "check-out" }),
            [intl.formatMessage({ id: "notes" })]: e.notes,
          };
        })
      : [];
  }, []);

  const handleClickLogout = useCallback(() => {
    return logout();
  }, [logout]);

  const handleClickAttend = useCallback(async () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      const confirmed = confirm(
        checkedIn
          ? intl.formatMessage({ id: "confirm-check-out" })
          : intl.formatMessage({ id: "confirm-check-in" })
      );

      if (confirmed) {
        const id = await attend({
          data: { x: longitude.toString(), y: latitude.toString() },
        });
        alert(intl.formatMessage({ id }));
        router.invalidate();
      }
    });
  }, [attend, router, intl, checkedIn]);

  const handleClickDeleteAddress = useCallback(
    (item: Address) => async () => {
      const confirmed = confirm(
        intl.formatMessage(
          { id: "confirm-delete-address" },
          { address: item.roadAddress }
        )
      );

      if (confirmed) {
        await deleteAddress({ data: item.id });
        router.invalidate();
      }
    },
    [deleteAddress, router]
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
    (date: number) => () => {
      const offset = dayjs().date(date);
      const start = offset.startOf("day");
      const end = offset.endOf("day");

      const attendanceMap = attendanceEvents.reduce(
        (acc, cur) => {
          const target = dayjs(cur.timestamp);
          if (target.isBefore(start) || target.isAfter(end)) {
            return acc;
          }
          acc[cur.uid] = Math.max(acc[cur.uid] || -1, cur.type);
          return acc;
        },
        {} as Record<string, AttendanceEventType>
      );

      const datas = users.reduce(
        (acc, user) => {
          const event = attendanceMap[user.id];
          if (event) {
            acc.push({ ...user, event });
          }
          return acc;
        },
        [] as (User & { event: AttendanceEventType })[]
      );

      modal.open(
        <div className="modal-box">
          <ul className="list">
            <li>
              <p className="caption">
                {intl.formatDate(offset.toDate(), {
                  month: "short",
                  day: "2-digit",
                }) +
                  " " +
                  intl.formatMessage({ id: "attend" })}
              </p>
            </li>
            {datas.map((data, index) => (
              <li key={data.id} className="list-row">
                <p>{index + 1}</p>
                <p>{data.name}</p>
                <p>
                  {data.event === AttendanceEventType.checkIn
                    ? intl.formatMessage({ id: "check-in" })
                    : intl.formatMessage({ id: "done" })}
                </p>
              </li>
            ))}
            {!datas.length && (
              <li className="list-row">
                <p>{intl.formatMessage({ id: "no-attendees" })}</p>
              </li>
            )}
          </ul>
          <div className="modal-action">
            <button
              className="btn btn-soft not-md:btn-block"
              onClick={modal.close}
            >
              닫기
            </button>
          </div>
        </div>
      );
    },
    [modal, intl, attendanceEvents, users]
  );

  return (
    <main className="min-h-screen mx-auto max-w-5xl p-4 md:p-10">
      <div className="card card-border border-base-content/5 w-full rounded-box">
        <div className="card-body px-4 my-auto">
          <div className="flex flex-row gap-2">
            <div className="indicator">
              <Avatar image={user.picture} name={user.name} />

              {user.admin && (
                <div
                  className="indicator-item text-accent tooltip"
                  data-tip={intl.formatMessage({ id: "admin" })}
                >
                  <CrownIcon className="size-4 rotate-45" />
                </div>
              )}

              {isDisabled && (
                <div
                  className="inline-grid *:[grid-area:1/1] indicator-item tooltip"
                  data-tip={intl.formatMessage({ id: "disable" })}
                >
                  <div className="status status-error animate-ping" />
                  <div className="status status-error" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center">
                <span className="font-semibold text-lg">{user.name}</span>
                {!isDisabled && (
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
            <button
              className="btn btn-error btn-soft"
              onClick={handleClickLogout}
            >
              {intl.formatMessage({ id: "sign-out" })}
            </button>

            {user.admin ? null : checkedOut ? (
              <button className="btn" disabled>
                {intl.formatMessage({ id: "done" })}
              </button>
            ) : (
              <button
                className="btn btn-soft btn-primary"
                onClick={handleClickAttend}
                disabled={checkedOut || isDisabled}
                data-checked-in={checkedIn}
              >
                {checkedIn
                  ? intl.formatMessage({ id: "check-out" })
                  : intl.formatMessage({ id: "check-in" })}
              </button>
            )}
          </div>
        </div>
      </div>

      {user.admin && (
        <>
          <div className="divider opacity-0" />

          <ul className="list border border-base-content/5 rounded-box">
            <li className="flex justify-between p-4 pb-2 items-center">
              <p className="caption">
                {intl.formatMessage({ id: "attendance-address" })}
              </p>
              <Link to="/address" className="btn btn-square btn-ghost">
                <AddIcon className="size-6" />
              </Link>
            </li>

            {addresses.map((item) => (
              <li className="list-row" key={item.id}>
                <div />
                <p className="self-center tracking-wide">{item.roadAddress}</p>
                <p className="list-col-wrap caption">{item.jibunAddress}</p>
                <button
                  onClick={handleClickDeleteAddress(item)}
                  className="btn btn-square btn-error btn-ghost"
                >
                  <DeleteIcon className="size-6" />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="divider opacity-0" />

      <div className="border border-base-content/5 rounded-box">
        <div className="flex justify-between p-4 pb-2 items-center">
          <p className="caption">
            {intl.formatMessage({ id: "attendance-status" })}
          </p>
          {user.admin ? (
            <CsvDownloadButton
              data={sheetData}
              message={intl.formatMessage({ id: "confirm-download" })}
              className="btn btn-ghost btn-square"
            >
              <DownloadIcon className="size-6" />
            </CsvDownloadButton>
          ) : null}
        </div>
        <table className="calendar md:text-xl table-fixed">
          <thead>
            <tr>
              {Array.from({ length: 7 }, (_, i) => {
                const date = dayjs().day(i).toDate();
                return (
                  <th key={i} data-sunday={i === 0} data-saturday={i === 6}>
                    {intl.formatDate(date, { weekday: "short" })}
                  </th>
                );
              })}
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
                    {user.admin && date > 0 && (
                      <p className="caption">{getAttendanceRatio(date)}%</p>
                    )}
                    {user.admin && (
                      <div
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

      {user.admin ? (
        <ul className="list border border-base-content/5 rounded-box">
          <li>
            <p className="caption p-4 pb-2 items-center">
              {intl.formatMessage({ id: "user-list" })}
            </p>
          </li>
          {users.map((user) => (
            <li key={user.id} className="list-row">
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
                      <span className="text-xl">{user.name?.slice(0, 1)}</span>
                    </div>
                  </div>
                )}

                {user.admin && (
                  <div
                    className="indicator-item text-accent tooltip"
                    data-tip={intl.formatMessage({ id: "admin" })}
                  >
                    <CrownIcon className="size-4 rotate-45" />
                  </div>
                )}

                {!!user.disabled && !user.admin && (
                  <div
                    className="inline-grid *:[grid-area:1/1] indicator-item tooltip"
                    data-tip={intl.formatMessage({ id: "disable" })}
                  >
                    <div className="status status-error animate-ping" />
                    <div className="status status-error" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center">
                  <span>{user.name}</span>
                  <button
                    className="btn btn-xs btn-square btn-ghost"
                    onClick={handleClickEditName(user)}
                  >
                    <EditIcon className="size-3 opacity-60" />
                  </button>
                </div>
                <div className="text-xs font-semibold opacity-60">
                  {user.email}
                </div>
              </div>

              {!user.admin && (
                <Link
                  to="/users/$uid"
                  params={{ uid: user.id }}
                  className="btn btn-square btn-ghost self-center"
                >
                  <RightIcon className="size-6" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="border border-base-content/5 rounded-box">
          <p className="caption p-4 pb-2">
            {intl.formatMessage({ id: "detail-history" })}
          </p>
          <table className="table">
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
                const date = new Date(e.timestamp);

                const datePart = intl.formatDate(date, {
                  month: "2-digit",
                  day: "2-digit",
                });

                const timePart = intl.formatTime(date, {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                });

                const eventType =
                  e.type === AttendanceEventType.checkIn
                    ? intl.formatMessage({ id: "check-in" })
                    : intl.formatMessage({ id: "check-out" });
                return (
                  <tr key={e.id}>
                    <td>{`${datePart} ${timePart}`}</td>
                    <td>{eventType}</td>
                    <td className="text-xs">{e.notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
