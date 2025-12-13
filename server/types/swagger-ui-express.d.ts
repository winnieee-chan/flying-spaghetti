declare module 'swagger-ui-express' {
  interface SwaggerUiOptions {
    serve: unknown[];
    setup: (spec: unknown) => unknown;
  }

  const swaggerUi: SwaggerUiOptions;
  export default swaggerUi;
}

