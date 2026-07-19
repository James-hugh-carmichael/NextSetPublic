import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type MyBand = {
  id: string;
  name: string | null;
  image_url: string | null;
  role: string | null;
  is_leader: boolean;
};

export function useMyBands() {
  const [bands, setBands] = useState<MyBand[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBands = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setBands([]);
      setLoading(false);
      return;
    }
    
    const { data: memberships, error: memberError } = await supabase
      .from("band_members")
      .select("band_id, role, is_leader")
      .eq("user_id", user.id);

    if (memberError || !memberships || memberships.length === 0) {
      setBands([]);
      setLoading(false);
      return;
    }

    const bandIds = memberships.map((m) => m.band_id);

    const { data: bandRows, error: bandError } = await supabase
      .from("Bands")
      .select("id, name, image_url")
      .in("id", bandIds);

    if (bandError || !bandRows) {
      setBands([]);
      setLoading(false);
      return;
    }

    const merged: MyBand[] = bandRows.map((band) => {
      const membership = memberships.find((m) => m.band_id === band.id);
      return {
        id: band.id,
        name: band.name,
        image_url: band.image_url,
        role: membership?.role ?? null,
        is_leader: membership?.is_leader ?? false,
      };
    });

    setBands(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBands();
  }, [fetchBands]);

  return { bands, loading, refetch: fetchBands };
}