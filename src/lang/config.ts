import koKR from "./ko-KR.json";
import enUS from "./en-US.json";

enum Locale {
  koKR = "ko-KR",
  enUS = "en-US",
}

export type Messages = typeof koKR;

export const getLocale = (lang: string) => {
  return lang === Locale.koKR ? lang : Locale.enUS;
};

export const getMessages = (lang: Locale) => {
  return lang === Locale.koKR ? koKR : enUS;
};
