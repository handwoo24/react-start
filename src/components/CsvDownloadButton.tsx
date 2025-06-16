/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ButtonHTMLAttributes, useCallback, useState } from "react";

interface CsvDownloadButtonProps<T extends Record<string, any>>
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  message: string;
  data: T[];
}

// flattenObject 함수는 그대로 사용
function flattenObject(
  obj: Record<string, any>,
  parentKey = "",
  result: Record<string, any> = {}
) {
  for (const [key, value] of Object.entries(obj)) {
    const newKey = parentKey ? `${parentKey}.${key}` : key;
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      flattenObject(value, newKey, result);
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

export const CsvDownloadButton = <T extends Record<string, any>>({
  message,
  data,
  ...props
}: CsvDownloadButtonProps<T>) => {
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(() => {
    if (!confirm(message)) return;

    setLoading(true);
    try {
      // 1) 데이터 평탄화 및 헤더 추출
      const flatData = data.map((row) =>
        flattenObject(row as Record<string, any>)
      );
      if (!flatData.length) {
        alert("다운로드할 데이터가 없습니다.");
        return;
      }
      const headers = Array.from(
        flatData.reduce<Set<string>>((set, obj) => {
          Object.keys(obj).forEach((k) => set.add(k));
          return set;
        }, new Set<string>())
      );

      // 2) CSV 문자열 생성 (BOM 포함)
      const escapeCsv = (value: unknown) => {
        if (value == null) return "";
        const str = String(value).replace(/"/g, '""');
        return `"${str}"`;
      };

      const rows = [
        headers.join(","),
        ...flatData.map((row) =>
          headers.map((h) => escapeCsv(row[h] ?? "")).join(",")
        ),
      ];

      // ★ 여기서 BOM(유니코드 마커) 붙이기 ★
      const BOM = "\uFEFF";
      const csvString = BOM + rows.join("\r\n");

      // 3) Blob 생성 및 다운로드
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const fileName = `attendance_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("CSV 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [data, message]);

  return (
    <button onClick={handleClick} disabled={loading} {...props}>
      {loading ? "생성 중..." : props.children}
    </button>
  );
};
