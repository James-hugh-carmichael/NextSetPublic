import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

export type ActiveAccount =
  | { type: "musician" }
  | { type: "band"; bandId: string };

function getStorageKey(userId: string) {
  return `nextset-active-account:${userId}`;
}

export function useActiveAccount(userId?: string) {
  const [activeAccount, setActiveAccountState] = useState<ActiveAccount>({
    type: "musician",
  });
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setActiveAccountState({ type: "musician" });
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      const value = await AsyncStorage.getItem(getStorageKey(userId));
      if (value) {
        const parsed = JSON.parse(value) as ActiveAccount;
        if (
          parsed.type === "musician" ||
          (parsed.type === "band" && typeof parsed.bandId === "string")
        ) {
          setActiveAccountState(parsed);
        }
      } else {
        setActiveAccountState({ type: "musician" });
      }
      setError(null);
    } catch (loadError) {
      setActiveAccountState({ type: "musician" });
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load the active account."
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setActiveAccount = useCallback(
    async (account: ActiveAccount) => {
      if (!userId) {
        throw new Error("You must be signed in to switch accounts.");
      }

      await AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(account));
      setActiveAccountState(account);
    },
    [userId]
  );

  return { activeAccount, loading, error, refresh, setActiveAccount };
}
