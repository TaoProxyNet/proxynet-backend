import {SortOrder} from "mongoose";

export interface IQueryItems<T> {
    searchFields: Partial<TSearchOption>,
    filterFields: Partial<T>,
    paginationFields: Partial<TPaginationOptions>,
    sortFields: Partial<TSortOptions<T>>,
}

export type TSearchOption = {
    search: string
}

export type TPaginationOptions = {
    page: number;
    limit: number;
    skip: number;
}
export const PaginationKeys = ["page", "limit"]

export type TSortOptions<T> = {
    sortBy: keyof T | string;
    sortOrder: SortOrder;
}
export const SortKeys = ["sortBy", "sortOrder"]

export type TMeta = {
    page: number,
    limit: number,
    total: number
}
export type TDataWithMeta<T> = {
    data: T,
    meta: TMeta,
}