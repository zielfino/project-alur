// src/routes/+page.ts
import { supabase } from '$lib/supabaseClient';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const { data } = await supabase.auth.getSession();

  return {
    session: data.session
  };
};