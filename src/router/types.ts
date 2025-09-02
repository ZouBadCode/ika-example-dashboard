export type Meta = {
  title?: string;
  path?: string;
  order?: number;
  hidden?: boolean;
};

export type PageModule = {
  default: React.ComponentType<any>;
  meta?: Meta;
};

export type MenuNode = {
  key: string;             // folder or page key
  title: string;           // folder name or page title
  path?: string;           // page only
  element?: React.ReactNode;
  children?: MenuNode[];   // folder children
  order?: number;
  hidden?: boolean;
};
