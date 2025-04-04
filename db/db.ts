import { createClient } from "@supabase/supabase-js";

// Ces variables d'environnement doivent être définies dans le fichier .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Log des premiers caractères des clés pour débogage
console.log("Supabase URL:", supabaseUrl);
console.log(
  "Service Role Key (first 10 chars):",
  supabaseServiceRoleKey.substring(0, 10) + "..."
);
console.log(
  "Anon Key (first 10 chars):",
  supabaseAnonKey.substring(0, 10) + "..."
);

// Créer un client Supabase simplifié
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Version simplifiée pour le côté client
export const createClientSideClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey);
};
