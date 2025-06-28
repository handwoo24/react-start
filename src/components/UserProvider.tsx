import { createContext, PropsWithChildren, useContext } from "react";
import { User } from "~/model/user";

const UserContext = createContext<User | null>(null);

export const useUser = () => useContext(UserContext);

export interface UserProviderProps extends PropsWithChildren {
  user: User | null;
}

export const UserProvider = ({ user, children }: UserProviderProps) => {
  return <UserContext value={user}>{children}</UserContext>;
};
