export type TName = {
    firstName: string;
    lastName: string;
}

export type TAddress = {
    streetAddress: string;
    city: string;
    state?: string;
    zipCode: number;
    country: string;
}

export type TMetadata = {
    title?: string;
    description?: string;
}