declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: "hash" | "history" | "abstract" | undefined;
    VUE_ROUTER_BASE: string | undefined;
  }
}

declare module "vue-smooth-dnd" {
  export var Container: any
  export var Draggable: any
}
