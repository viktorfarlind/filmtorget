import { createClient } from '@supabase/supabase-js';

/**
 * Hämtar miljövariabler för Supabase-anslutningen.
 * Dessa laddas från .env.local i utvecklingsmiljö och från Vercels miljöinställningar i produktion.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Säkerhetskontroll under byggprocessen.
 * Om dessa saknas kommer applikationen inte kunna kommunicera med databasen,
 * vilket belyses i rapporten gällande miljökonfiguration.
 */
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Build warning: Supabase environment variables are missing.");
}

/**
 * Initierar Supabase-klienten.
 * Denna instans används genomgående i applikationen för:
 * 1. Datahämtning via PostgreSQL (med Row Level Security).
 * 2. Autentisering av användare.
 * 3. Realtidsprenumerationer via WebSockets (wss://), vilket möjliggör chattfunktionen.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);