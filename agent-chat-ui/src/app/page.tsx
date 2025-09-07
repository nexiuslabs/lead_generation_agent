"use client";

import { Thread } from "@/components/thread";
import { StreamProvider } from "@/providers/Stream";
import { ThreadProvider } from "@/providers/Thread";
import { ArtifactProvider } from "@/components/thread/artifact";
import { Toaster } from "@/components/ui/sonner";
import React from "react";
import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import HeaderBar from "@/components/ui/header-bar";
import { FirstLoginGate } from "@/components/onboarding/FirstLoginGate";

export default function DemoPage(): React.ReactNode {
  const { status } = useSession();
  useEffect(() => {
    if (status === "unauthenticated") {
      void signIn("nexius", { callbackUrl: "/" });
    }
  }, [status]);
  if (status === "loading") {
    return <div />;
  }
  if (status === "unauthenticated") {
    return <div />;
  }
  return (
    <React.Suspense fallback={<div>Loading (layout)...</div>}>
      <HeaderBar />
      <Toaster />
      <FirstLoginGate>
        <ThreadProvider>
          <StreamProvider>
            <ArtifactProvider>
              <Thread />
            </ArtifactProvider>
          </StreamProvider>
        </ThreadProvider>
      </FirstLoginGate>
    </React.Suspense>
  );
}
