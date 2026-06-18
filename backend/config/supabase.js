import { createClient } from "@supabase/supabase-js";
import { config } from "./env.js";

const supabase = config.supabaseUrl && config.supabaseKey
  ? createClient(config.supabaseUrl, config.supabaseKey)
  : null;

export default supabase;
