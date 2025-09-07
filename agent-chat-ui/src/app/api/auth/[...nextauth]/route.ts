import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { Issuer } from "openid-client";

async function buildProviders() {
  const providers: any[] = [];
  const issuerUrl = process.env.NEXIUS_ISSUER;
  const cid = process.env.NEXIUS_CLIENT_ID;
  const secret = process.env.NEXIUS_CLIENT_SECRET;
  if (issuerUrl && cid && secret) {
    try {
      const discovered = await Issuer.discover(issuerUrl);
      providers.push({
        id: "nexius",
        name: "Nexius",
        type: "oauth",
        version: "2.0",
        idToken: true,
        checks: ["pkce", "state"],
        authorization: { params: { scope: "openid profile email" } },
        clientId: cid,
        clientSecret: secret,
        issuer: discovered.issuer,
        wellKnown: `${discovered.issuer}/.well-known/openid-configuration`,
        profile(profile: any) {
          return { id: profile.sub, email: profile.email } as any;
        },
      });
    } catch (e) {
      console.warn(
        "Nexius OIDC discovery failed; falling back to dev credentials login.",
        e
      );
    }
  }
  if (providers.length === 0) {
    // Dev-only fallback to unblock local development when SSO env is not set
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Nexius SSO (OIDC) is not configured in production. Set NEXIUS_ISSUER, NEXIUS_CLIENT_ID, NEXIUS_CLIENT_SECRET."
      );
    }
    providers.push(
      Credentials({
        name: "Login",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(creds) {
          const email = (creds as any)?.email;
          const password = (creds as any)?.password;
          if (!email || !password) return null;
          const tenant = process.env.DEFAULT_TENANT_ID || "dev";
          return { id: email, email, tenant_id: tenant } as any;
        },
      })
    );
  }
  return providers;
}

const handler = NextAuth({
  providers: await buildProviders(),
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.id_token) (token as any).id_token = account.id_token;
      // Map from OIDC profile or Credentials user
      const anyProf: any = profile as any;
      if (anyProf) {
        (token as any).tenant_id =
          anyProf.tenant_id ??
          anyProf["https://claims/tenant_id"] ??
          (token as any).tenant_id ??
          null;
        (token as any).roles =
          anyProf.roles ?? anyProf["https://claims/roles"] ?? (token as any).roles ?? [];
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).idToken = (token as any).id_token;
      (session as any).tenantId = (token as any).tenant_id ?? null;
      (session as any).roles = (token as any).roles ?? [];
      return session;
    },
  },
});

export { handler as GET, handler as POST };
