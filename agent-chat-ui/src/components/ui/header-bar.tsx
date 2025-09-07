"use client";

import { useSession, signOut } from "next-auth/react";
import React, { useEffect, useMemo, useState } from "react";
import { useAuthFetch } from "@/lib/useAuthFetch";

export default function HeaderBar() {
  const { data: session } = useSession();
  const email = (session as any)?.user?.email as string | undefined;
  const tenantId = (session as any)?.tenantId as string | undefined;
  const [enabled, setEnabled] = useState(false);
  const [override, setOverride] = useState("");
  const [hasOverride, setHasOverride] = useState(false);
  const authFetch = useAuthFetch();
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE || "http://localhost:2024", []);
  const [verifying, setVerifying] = useState(false);
  const [verifyNote, setVerifyNote] = useState<string | null>(null);

  useEffect(() => {
    const flag = (process.env.NEXT_PUBLIC_ENABLE_TENANT_SWITCHER || "").toLowerCase() === "true";
    setEnabled(flag);
    if (typeof window !== "undefined") {
      try {
        const v = window.localStorage.getItem("lg:chat:tenantId");
        if (v) {
          setOverride(v);
          setHasOverride(true);
        }
      } catch {}
    }
  }, []);

  const applyOverride = () => {
    try {
      if (override) {
        window.localStorage.setItem("lg:chat:tenantId", override);
        window.location.reload();
      }
    } catch {}
  };
  const clearOverride = () => {
    try {
      window.localStorage.removeItem("lg:chat:tenantId");
      window.location.reload();
    } catch {}
  };

  const verifyOdoo = async () => {
    setVerifying(true);
    setVerifyNote(null);
    try {
      const res = await authFetch(`${apiBase}/onboarding/verify_odoo`);
      const body = await res.json();
      if (body.ready) setVerifyNote("Odoo: ready (mapping exists, smoke passed)");
      else if (body.exists && !body.smoke) setVerifyNote(`Odoo: mapping exists, smoke failed${body.error ? ": "+body.error : ""}`);
      else setVerifyNote(`Odoo: not ready${body.error ? ": "+body.error : ""}`);
    } catch (e: any) {
      setVerifyNote(`Odoo verify error: ${String(e)}`);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="w-full border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
      <div className="mx-auto max-w-6xl px-4 py-2 flex items-center gap-3 justify-between">
        <div className="text-sm text-muted-foreground truncate">
          {email ? (
            <span>
              Signed in as <span className="font-medium text-foreground">{email}</span>
              {" "+(tenantId ? `(tenant: ${tenantId}${hasOverride ? ", override" : ""})` : "")}
            </span>
          ) : (
            <span>Authenticating…</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            className="text-sm px-2 py-1 border rounded"
            onClick={verifyOdoo}
            disabled={verifying}
            title="Verify Odoo connectivity for your tenant"
          >
            {verifying ? "Verifying…" : "Verify Odoo"}
          </button>
          {verifyNote && (
            <span className="text-xs text-muted-foreground">{verifyNote}</span>
          )}
          {enabled && (
            <div className="flex items-center gap-2">
              <input
                className="px-2 py-1 border rounded text-sm"
                placeholder="tenant override"
                value={override}
                onChange={(e) => setOverride(e.target.value)}
              />
              <button className="text-sm px-2 py-1 border rounded" onClick={applyOverride}>
                Use
              </button>
              {hasOverride && (
                <button className="text-sm px-2 py-1 border rounded" onClick={clearOverride}>
                  Clear
                </button>
              )}
            </div>
          )}
          <button
            className="text-sm px-2 py-1 border rounded"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
