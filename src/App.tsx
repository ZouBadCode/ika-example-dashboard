import "./App.css";
import Navbar from "@/components/navbar";
import IkaScanBubble from "@/components/IkaScanBubble";
import { useMemo } from "react";
import { useRoutes, Navigate } from "react-router-dom";
import { buildMenuAndRoutes } from "@/router/registry";

export default function App() {
  // Memoize only the "static routes data"
  const routesConfig = useMemo(() => {
    const { routes, menuTree } = buildMenuAndRoutes();
    return { routes, menuTree };
  }, []);

  // useRoutes should be called directly during render (do not put it in useMemo)
  const element = useRoutes([
    // Automatically redirect the root path to /index
    { path: "/", element: <Navigate to="/index" replace /> },
    ...routesConfig.routes,
    { path: "*", element: <div className="p-6">Not Found</div> },
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">{element}</main>
      <IkaScanBubble />
    </div>
  );
}
