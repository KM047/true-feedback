"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";

export default function AuthProvide({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SessionProvider>{children}</SessionProvider>;
}
