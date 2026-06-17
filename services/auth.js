import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";

export const useUser = () => {
  const [user, setUser] = useState(null);
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


export const signUp = (email, password) => {
  return supabase.auth.signUp({ email, password });
};

export const signIn = (email, password) => {
  return supabase.auth.signInWithPassword({ email, password });
};

export const signOut = () => {
  return supabase.auth.signOut();
};