declare module 'swagger-jsdoc' {
  interface Options {
    definition: {
      openapi: string;
      info: {
        title: string;
        version: string;
        description?: string;
        contact?: {
          name?: string;
        };
      };
      servers?: Array<{
        url: string;
        description?: string;
      }>;
      components?: {
        schemas?: Record<string, unknown>;
      };
    };
    apis: string[];
  }

  function swaggerJsdoc(options: Options): unknown;
  export default swaggerJsdoc;
}

