import React from "react";
import { type PageModule, type MenuNode } from "./types";

// 1) Load all page modules eagerly so we can read meta
const modules = import.meta.glob<PageModule>("/src/pages/**/index.tsx", { eager: true });

// Helper: convert "src/pages/tools/DWalletQueryer/index.tsx"
// → segments: ["tools","DWalletQueryer"]
function pathToSegments(filePath: string) {
  const parts = filePath
    .replace(/^\/?src\/pages\//, "")
    .replace(/\/index\.tsx$/, "")
    .split("/")
    .filter(Boolean);
  return parts;
}

function toKebab(s: string) {
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function ensurePathFromSegments(segments: string[]) {
  return "/" + segments.map(toKebab).join("/");
}

function sortMenu(nodes: MenuNode[]) {
  nodes.sort((a, b) => {
    const ao = a.order ?? 1000;
    const bo = b.order ?? 1000;
    if (ao !== bo) return ao - bo;
    return a.title.localeCompare(b.title);
  });
  nodes.forEach((n) => n.children && sortMenu(n.children));
}

// 2) Build a tree: folders become groups; leaves are pages
export function buildMenuAndRoutes() {
  const root: MenuNode = { key: "__root__", title: "__root__", children: [] };

  Object.entries(modules).forEach(([file, mod]) => {
    const segments = pathToSegments(file);
    if (segments.length === 0) return;

    // read meta
    const Component = mod.default;
    const meta = mod.meta ?? {};
    const pageTitle = meta.title ?? segments[segments.length - 1];
    const path = meta.path ?? ensurePathFromSegments(segments);
    const order = meta.order;
    const hidden = meta.hidden;

    // Insert into tree
    let cursor = root;
    // all but last are folders
    for (let i = 0; i < segments.length - 1; i++) {
      const key = segments[i];
      const existing = cursor.children?.find((c) => c.key === key);
      if (existing) {
        cursor = existing;
      } else {
        const node: MenuNode = {
          key,
          title: toKebab(key), // display folder as kebab-case; customize if needed
          children: [],
        };
        cursor.children = cursor.children ?? [];
        cursor.children.push(node);
        cursor = node;
      }
    }

    // last segment = page
    const pageKey = segments[segments.length - 1];
    const leaf: MenuNode = {
      key: pageKey,
      title: pageTitle,
      path,
      element: React.createElement(Component),
      order,
      hidden,
    };
    cursor.children = cursor.children ?? [];
    cursor.children.push(leaf);
  });

  // Sort folders & pages
  if (root.children) sortMenu(root.children);

  // 3) Convert tree to react-router routes
  // Only leaves (with element) become route records.
  const routes = collectRoutes(root);

  return { menuTree: root.children ?? [], routes };
}

function collectRoutes(node: MenuNode): { path: string; element: React.ReactNode }[] {
  const list: { path: string; element: React.ReactNode }[] = [];
  if (node.element && node.path) list.push({ path: node.path, element: node.element });
  node.children?.forEach((c) => list.push(...collectRoutes(c)));
  return list;
}
