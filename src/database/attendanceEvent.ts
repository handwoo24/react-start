import { firestore } from "~/firebase/config";
import {
  AttendanceEvent,
  attendanceEventSchema,
  AttendanceEventType,
} from "~/model/attendanceEvents";
import dayjs from "dayjs";
import { CollectionReference } from "firebase-admin/firestore";
import { z } from "zod";

const attendanceParamsDto = attendanceEventSchema.pick({
  uid: true,
  userAgent: true,
  ipAddress: true,
  x: true,
  y: true,
});

type AttendanceParams = z.infer<typeof attendanceParamsDto>;

const collection = () =>
  firestore.collection("attendanceEvents") as CollectionReference<
    Omit<AttendanceEvent, "id">
  >;

export const isCheckedIn = async (uid: string, start: number, end: number) => {
  const existsQuery = await collection()
    .where("timestamp", ">=", start)
    .where("timestamp", "<=", end)
    .where("uid", "==", uid)
    .where("type", "==", AttendanceEventType.checkIn)
    .limit(1)
    .get();

  return !!existsQuery.size;
};

export const isCheckedOut = async (uid: string, start: number, end: number) => {
  const existsQuery = await collection()
    .where("timestamp", ">=", start)
    .where("timestamp", "<=", end)
    .where("uid", "==", uid)
    .where("type", "==", AttendanceEventType.checkOut)
    .limit(1)
    .get();

  return !!existsQuery.size;
};

export const checkIn = async (params: AttendanceParams) => {
  try {
    const parsed = attendanceParamsDto.parse(params);

    const now = dayjs();
    const start = now.startOf("day").valueOf();
    const end = now.endOf("day").valueOf();

    if (await isCheckedIn(parsed.uid, start, end)) {
      throw new Error("User has already checked in today.");
    }

    return collection().add({
      ...parsed,
      type: AttendanceEventType.checkIn,
      timestamp: now.valueOf(),
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to Check in");
  }
};

export const checkOut = async (params: AttendanceParams) => {
  try {
    const parsed = attendanceParamsDto.parse(params);

    const now = dayjs();
    const start = now.startOf("day").valueOf();
    const end = now.endOf("day").valueOf();

    if (!(await isCheckedIn(parsed.uid, start, end))) {
      throw new Error("User has not checked in yet.");
    } else if (await isCheckedOut(parsed.uid, start, end)) {
      throw new Error("User has already checked out today.");
    }

    return collection().add({
      ...parsed,
      type: AttendanceEventType.checkOut,
      timestamp: now.valueOf(),
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to Check out");
  }
};

export const getUserAttendanceEvents = async (
  uid: string,
  start: number,
  end: number
) => {
  try {
    const snapshot = await collection()
      .where("uid", "==", uid)
      .where("timestamp", ">=", start)
      .where("timestamp", "<=", end)
      .orderBy("timestamp", "desc")
      .get();

    return snapshot.docs.reduce((acc, cur) => {
      const data = cur.data();
      if (!data) {
        return acc;
      }
      return [...acc, { id: cur.id, ...data }];
    }, [] as AttendanceEvent[]);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get user attendance events");
  }
};

export const getAttendanceEvents = async (start: number, end: number) => {
  try {
    const snapshot = await collection()
      .where("timestamp", ">=", start)
      .where("timestamp", "<=", end)
      .orderBy("timestamp", "desc")
      .get();

    return snapshot.docs.reduce((acc, cur) => {
      const data = cur.data();
      if (!data) {
        return acc;
      }
      return [...acc, { id: cur.id, ...data }];
    }, [] as AttendanceEvent[]);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get user attendance events");
  }
};

export const deleteAttendanceEvent = async (id: string) => {
  try {
    return collection().doc(id).delete();
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete attendance event");
  }
};
