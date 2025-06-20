import {TGenericErrorMessages} from "@/Utils/types/errors.type";

export type TCustomErrorResponse = {
    statusCode: number;
    message: string;
    errorMessages?: TGenericErrorMessages[];
    stack?: string;
}

export type TGenericSuccessMessages<T, M> = {
    statusCode: number;
    message: string;
    data?: T;
    meta?: M;
}