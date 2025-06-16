import { CollectionReference } from "firebase-admin/firestore";
import { firestore } from "~/firebase/config";
import { Account } from "~/model/account";

export const collection = () =>
  firestore.collection("accounts") as CollectionReference<Omit<Account, "id">>;

export const getAccountByGoogle = async (sub: string) => {
  try {
    const query = collection().where("providerAccountId", "==", sub);
    const snapshot = await query.get();
    const doc = snapshot.docs.at(0);
    if (!doc) {
      return null;
    }

    return { ...doc.data(), id: doc.id };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get account");
  }
};
