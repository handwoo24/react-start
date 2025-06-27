/// <reference types="vite-plugin-svgr/client" />

declare module "*.sql?raw" {
  const content: string;
  export default content;
}
