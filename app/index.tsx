import { useEffect } from "react";
import { useRouter } from "expo-router";
import "expo-router/entry"

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login as the entry point (handles both login and sign up)
    router.replace("/Login");
  }, [router]);

  return null;
}