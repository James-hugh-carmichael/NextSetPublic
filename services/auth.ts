import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return { user, loading };
};

export const signUp = (email: string, password: string) => {
  return supabase.auth.signUp({ email, password });
};

export const signIn = (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
};

export const signOut = () => {
  return supabase.auth.signOut();
};
