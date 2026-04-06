import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/appError.util";

export const errorMiddleware = (
    error: any,
    req: Request,
    res: Response,
) => {

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            error: error.message
        });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {

        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                error: "DUPLICATED_RECORD"
            });
        }

        if (error.code === "P2025") {
            return res.status(404).json({
                success: false,
                error: "RECORD_NOT_FOUND"
            });
        }
    }

    console.error(error);

    return res.status(500).json({
        success: false,
        error: "INTERNAL_SERVER_ERROR"
    });
};