import { createFileRoute } from "@tanstack/react-router";
import { FavoriteFreeze } from "@/components/favorite-freeze";

export const Route = createFileRoute("/play")({
  component: Play,
});

function Play() {
  return <FavoriteFreeze />;
}
