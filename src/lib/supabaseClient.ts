import { createClient } from "@supabase/supabase-js";

const sbUrl = process.env.SUPABASE_URL!;
const sbKey = process.env.SUPABASE_PUBLISHABLE_KEY!; // Use a ANON key aqui, pois é client-side

export const supabase = createClient(sbUrl, sbKey, {
  realtime: {
    params: {
      eventsPerSecond: 10, // Limita eventos para não travar a rede (mouse move gera muitos!)
    },
  },
});
