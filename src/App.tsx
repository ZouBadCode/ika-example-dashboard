import "./App.css";
import Navbar from "@/components/navbar";
import { useMemo } from "react";
import { useRoutes } from "react-router-dom";
import { buildMenuAndRoutes } from "@/router/registry";

export default function App() {
  // 只 memo「靜態的 routes 資料」
  const routesConfig = useMemo(() => {
    const { routes, menuTree } = buildMenuAndRoutes();
    return { routes, menuTree };
  }, []);

  // useRoutes 應在 render 時直接呼叫（不要放進 useMemo）
  const element = useRoutes([
    ...routesConfig.routes,
    { path: "*", element: <div className="p-6">Not Found</div> },
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">{element}</main>
    </div>
  );
}
