/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_RPC_URL?: string;
  readonly VITE_CHAIN_ID?: string;
  readonly VITE_CHAIN_NAME?: string;
  // add more if you use them:
  // readonly VITE_SOME_FLAG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

