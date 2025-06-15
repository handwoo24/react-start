import { firestore } from "@/firebase/config";
import { Address } from "@/model/address";
import { CollectionReference } from "firebase-admin/firestore";

const collection = () =>
  firestore.collection("addresses") as CollectionReference<Omit<Address, "id">>;

export const getAddressCount = async () => {
  const snapshot = await collection().count().get();

  return snapshot.data().count;
};

export const addAddress = async (params: Omit<Address, "id">) => {
  try {
    return collection().doc().create(params);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create address");
  }
};

export const getAddresses = async () => {
  try {
    const snapshot = await collection().limit(10).get();

    return snapshot.docs.reduce((acc, cur) => {
      const data = cur.data();
      if (data) {
        acc.push({ id: cur.id, ...data });
      }
      return acc;
    }, [] as Address[]);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get addresses");
  }
};

export const deleteAddress = async (id: string) => {
  try {
    return collection().doc(id).delete();
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete address");
  }
};
