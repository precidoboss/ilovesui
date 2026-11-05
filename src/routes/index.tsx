import { createFileRoute } from "@tanstack/react-router";
import { FavoriteFreeze } from "@/components/favorite-freeze";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <FavoriteFreeze />;
}
