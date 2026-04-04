import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "ITESA-CIS API",
            version: "1.0.0",
            description: "Backend API for ITESA CIS platform.",
        },
        servers: [
            {
                url: "http://localhost:3000/api/v1",
                description: "Local Development Server",
            },
        ],
    },
    // Pattern to find routes and read JSDoc tags
    apis: ["./src/routes/*.ts"],
};

export const swaggerSpecs = swaggerJsdoc(options);
