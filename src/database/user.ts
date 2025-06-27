import {
  User,
  zodAccountSchema,
  zodUserSchema,
  type Account,
} from "~/model/user";
import { TokenPayload } from "google-auth-library";
import getAccountSQL from "./sql/user/getAccount.sql?raw";
import getUserSQL from "./sql/user/getUser.sql?raw";
import createUserAccountSQL from "./sql/user/createUserAccount.sql?raw";
import { querySingle } from "./query";

export const getAccountByGoogle = (sub: string) =>
  querySingle<Account>(getAccountSQL, [sub, "google"], zodAccountSchema, {
    throwOnEmpty: false,
    queryErrorMessage: "Failed to get account",
    parseErrorPrefix: "Failed to parse account data:",
  });

export const getUser = (uid: string) =>
  querySingle<User>(getUserSQL, [uid], zodUserSchema, {
    throwOnEmpty: false,
    queryErrorMessage: "Failed to get user",
    parseErrorPrefix: "Failed to parse user data:",
  });

export const createUserByGoogle = (idToken: TokenPayload) =>
  querySingle<User>(
    createUserAccountSQL,
    [
      idToken.name,
      idToken.email,
      idToken.email_verified ?? false,
      idToken.picture ?? null,
      "google",
      idToken.sub,
      false,
    ],
    zodUserSchema,
    {
      throwOnEmpty: true,
      emptyErrorMessage: "Failed to create user account",
      queryErrorMessage: "Failed to create user",
      parseErrorPrefix: "Failed to parse created user data:",
    }
  );
