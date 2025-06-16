"use client";

import { InputHTMLAttributes, useLayoutEffect, useRef } from "react";

export interface SearchInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
}

export const SearchInput = ({
  name,
  autoFocus,
  placeholder,
  defaultValue,
  ...props
}: SearchInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    if (!autoFocus) return;
    const length = inputRef.current?.value.length || 0;
    inputRef.current?.setSelectionRange(length, length);
    inputRef.current?.focus();
  }, [autoFocus]);

  return (
    <input
      {...props}
      type="search"
      required
      minLength={1}
      name={name}
      placeholder={placeholder}
      defaultValue={defaultValue}
      ref={inputRef}
    />
  );
};
