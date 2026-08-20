"use client";

import { useMemo } from "react";

type SafeHtmlProps = {
  html: string;
  className?: string;
};

function sanitizeHtml(input: string) {
  if (typeof window === "undefined") return input;

  const doc = new DOMParser().parseFromString(input, "text/html");

  const blocked = doc.querySelectorAll(
    "script,style,iframe,object,embed,link,meta",
  );
  blocked.forEach((n) => n.remove());

  const all = doc.body.querySelectorAll("*");
  all.forEach((el) => {
    [...el.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value;

      if (name.startsWith("on")) {
        el.removeAttribute(attr.name);
        return;
      }

      if ((name === "href" || name === "src") && /^\s*javascript:/i.test(value)) {
        el.removeAttribute(attr.name);
      }
    });
  });

  return doc.body.innerHTML;
}

export function stripHtmlToText(input: string) {
  if (typeof window === "undefined") {
    return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }

  const doc = new DOMParser().parseFromString(input, "text/html");
  return (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
}

export default function SafeHtml({ html, className }: SafeHtmlProps) {
  const safe = useMemo(() => sanitizeHtml(String(html ?? "")), [html]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
