import { useEffect } from "react";
import { useRouter } from "expo-router";
import "expo-router/entry"

/**
  * The main entry point of the application.
 */

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/Login");
  }, [router]);

  return null;
}