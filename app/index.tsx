import { useEffect } from "react";
import { useRouter } from "expo-router";
import "expo-router/entry"

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/Login");
  }, [router]);

  return null;
}