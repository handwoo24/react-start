import { InputHTMLAttributes } from "react";
import SearchIcon from "~/icons/search.svg?react";

export const SearchInput = ({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <label className={className}>
      <SearchIcon className="size-6" />
      <input type="search" {...props} />
    </label>
  );
};
