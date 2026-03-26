const baseUrl =
  import.meta.env.VITE_NEON_AUTH_URL ||
  ("https://ep-crimson-cell-aglayhcm.neonauth.c-2.eu-central-1.aws.neon.tech/neondb/auth" as
    | string
    | undefined);

export type NeonAuthClient = {
  signIn?: {
    email?: (opts: {
      email: string;
      password: string;
    }) => Promise<{ data?: { user?: { email?: string; name?: string } } }>;
  };
  signUp?: {
    email?: (opts: {
      email: string;
      password: string;
      name: string;
    }) => Promise<unknown>;
  };
  getSession?: () => Promise<{
    data?: { user?: { email?: string; name?: string } };
  }>;
};

let _authClient: NeonAuthClient | null = null;

/** Neon Auth is optional. When VITE_NEON_AUTH_URL is set, install a Neon Auth client and use it here; until then we use backend-only auth. */
export async function getAuthClient(): Promise<NeonAuthClient | null> {
  if (!baseUrl) return null;
  if (_authClient) return _authClient;
  return null;
}
