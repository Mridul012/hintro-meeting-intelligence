"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Hintro Meeting Intelligence API",
            version: "1.0.0",
            description: "AI-powered meeting intelligence service that helps users manage meetings, extract actionable insights, and track follow-ups.",
        },
        servers: [
            { url: "http://localhost:3000", description: "Local development" },
            { url: "https://placeholder.com", description: "Production" },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                TranscriptEntry: {
                    type: "object",
                    required: ["timestamp", "speaker", "text"],
                    properties: {
                        timestamp: { type: "string", example: "00:10" },
                        speaker: { type: "string", example: "John" },
                        text: { type: "string", example: "We should launch next Friday." },
                    },
                },
                Citation: {
                    type: "object",
                    properties: {
                        timestamp: { type: "string", example: "00:10" },
                    },
                },
                Meeting: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        title: { type: "string" },
                        meetingDate: { type: "string", format: "date-time" },
                        participants: { type: "array", items: { type: "string" } },
                        transcript: {
                            type: "array",
                            items: { $ref: "#/components/schemas/TranscriptEntry" },
                        },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                ActionItem: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        meetingId: { type: "string", format: "uuid" },
                        task: { type: "string" },
                        assignee: { type: "string" },
                        dueDate: { type: "string", format: "date-time", nullable: true },
                        status: {
                            type: "string",
                            enum: ["PENDING", "IN_PROGRESS", "COMPLETED"],
                        },
                        citations: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Citation" },
                        },
                    },
                },
                SuccessResponse: {
                    type: "object",
                    properties: {
                        traceId: { type: "string" },
                        success: { type: "boolean", example: true },
                        data: { type: "object" },
                    },
                },
                ErrorResponse: {
                    type: "object",
                    properties: {
                        traceId: { type: "string" },
                        success: { type: "boolean", example: false },
                        error: {
                            type: "object",
                            properties: {
                                code: { type: "string" },
                                message: { type: "string" },
                            },
                        },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ["./src/routes/*.ts"],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
//# sourceMappingURL=swagger.js.map