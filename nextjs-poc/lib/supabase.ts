import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!supabaseServiceKey) {
  throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY');
}

// Server-side client with service role for build time
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Types for our data
export interface SiteStyles {
  id: string;
  project_id: string;
  primary_color?: string;
  secondary_color?: string;
  tertiary_color?: string;
  text_color?: string;
  background_color?: string;
  dark_color?: string;
  light_color?: string;
  white_color?: string;
  primary_font?: string;
  secondary_font?: string;
  primary_button_background_color?: string;
  primary_button_text_color?: string;
  primary_button_border_color?: string;
  primary_button_hover_color?: string;
  primary_button_size?: string;
  primary_button_radius?: string;
  primary_button_font?: string;
  primary_button_font_weight?: string;
  secondary_button_background_color?: string;
  secondary_button_text_color?: string;
  secondary_button_border_color?: string;
  secondary_button_hover_color?: string;
  secondary_button_size?: string;
  secondary_button_radius?: string;
  secondary_button_font?: string;
  secondary_button_font_weight?: string;
  outline_text_color?: string;
  outline_border_color?: string;
  outline_hover_bg?: string;
  tertiary_button_size?: string;
  tertiary_button_radius?: string;
  tertiary_button_font?: string;
  tertiary_button_font_weight?: string;
  textlink_button_text_color?: string;
  textlink_button_hover_color?: string;
  button_style?: string;
}

export interface Project {
  id: string;
  name: string;
  subdomain?: string;
  custom_domain?: string;
}