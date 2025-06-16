import { firestore } from "~/firebase/config";
import { User, zodUserSchema } from "~/model/user";
import { CollectionReference } from "firebase-admin/firestore";
import { z } from "zod";
import { TokenPayload } from "google-auth-library";
import { collection as accounts } from "./account";
import { zodAccountSchema } from "~/model/account";

const collection = () =>
  firestore.collection("users") as CollectionReference<Omit<User, "id">>;

export const getUsers = async () => {
  try {
    const snapshot = await collection().orderBy("name", "asc").get();
    return snapshot.docs.reduce((acc, cur) => {
      const data = cur.data();
      if (!data) {
        return acc;
      }
      return [...acc, { id: cur.id, ...data }];
    }, [] as User[]);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get users");
  }
};

export const getUser = async (userId: string) => {
  try {
    const snapshot = await collection().doc(userId).get();
    const data = snapshot.data();
    if (!data) {
      return null;
    }
    return { id: snapshot.id, ...data };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get users");
  }
};

export const createUserByGoogle = async (idToken: TokenPayload) => {
  try {
    const batch = firestore.batch();

    const userRef = collection().doc();
    const accountRef = accounts().doc();

    const user = zodUserSchema.omit({ id: true }).parse({
      name: idToken.name,
      email: idToken.email,
      emailVerified: idToken.email_verified,
      picture: idToken.picture,
      admin: false,
    });

    const account = zodAccountSchema.omit({ id: true }).parse({
      userId: userRef.id,
      provider: "google",
      providerAccountId: idToken.sub,
    });

    batch.create(userRef, user);

    batch.create(accountRef, account);

    await batch.commit();

    return { id: userRef.id, ...user };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create user");
  }
};

const updateUserParamsDto = z
  .object({
    name: z.string().min(2).max(10),
    disabled: z.boolean(),
  })
  .partial();

type UpdateUserParams = z.infer<typeof updateUserParamsDto>;

export const updateUser = async (userId: string, params: UpdateUserParams) => {
  try {
    const parsed = updateUserParamsDto.parse(params);
    return collection().doc(userId).update(parsed);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update users");
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const query = collection().where("email", "==", email).limit(1);
    const snapshot = await query.get();
    const doc = snapshot.docs.at(0);
    if (!doc) {
      return null;
    }

    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get user");
  }
};
