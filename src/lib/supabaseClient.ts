import { createClient } from "@supabase/supabase-js";

const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!sbUrl || !sbKey) {
  throw new Error(
    "Variáveis de ambiente do Supabase (NEXT_PUBLIC_...) não encontradas."
  );
}

export const supabase = createClient(sbUrl, sbKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
