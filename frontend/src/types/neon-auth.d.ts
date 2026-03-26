declare module "@neondatabase/neon-js/auth" {
  export function createAuthClient(baseUrl: string): {
    signIn?: { email?: (opts: { email: string; password: string }) => Promise<{ data?: { user?: { email?: string; name?: string } } }> };
    signUp?: { email?: (opts: { email: string; password: string; name: string }) => Promise<unknown> };
    getSession?: () => Promise<{ data?: { user?: { email?: string; name?: string } } }>;
  };
}
