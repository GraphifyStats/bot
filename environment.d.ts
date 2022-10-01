declare global {
  namespace NodeJS {
    interface ProcessEnv {
      token: string;
      secret: string;
      googleKey: string;
    }
  }
}

export {};
