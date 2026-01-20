/// <reference types="https://deno.land/x/types/index.d.ts" />

// Deno global types for Supabase Edge Functions
declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
    serve(handler: (req: Request) => Response | Promise<Response>): void;
  };
}

export {};
