// types/express.d.ts
// src/types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      /**
       * Minimal shape yang kita pakai di middleware.
       * role: 'owner' | 'user' supaya tidak perlu impor dari @prisma/client
       */
      user?: {
        id: number;
        email?: string | null;
        role: 'owner' | 'user';
      };
    }
  }
}

// diperlukan agar file diperlakukan sebagai module oleh TS
export {};
