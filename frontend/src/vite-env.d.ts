/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_GATEWAY_URL?: string;
  readonly VITE_APP_TITLE?: string;
  readonly VITE_ENABLE_ANALYTICS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
