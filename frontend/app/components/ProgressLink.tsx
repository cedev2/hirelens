"use client";

import Link from "next/link";
import { ComponentProps } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

export default function ProgressLink({
  children,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        NProgress.start();
        props.onClick?.(e);
      }}
    >
      {children}
    </Link>
  );
}
