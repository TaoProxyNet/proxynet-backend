import { ESessionType } from "@/App/modules/Auth/auth.types";
import { RedisClient } from "@/Config/redis";


/*@ 
  TAG: for exact match
  TEXT: for full/partial/fuzzy text search
*/
interface SchemaField {
    [key: string]: 'TAG' | 'TEXT' | 'NUMERIC' | 'GEO';
}
const formatSchemaFields = (schema: SchemaField): string[] => {
    console.log("formatSchemaFields");
    return Object.entries(schema).flatMap(([field, type]) => [field, type]);
};

type TCreateIndexPayload = {
    type: ESessionType,
    schema: SchemaField
}

const createIndex = async (payload: TCreateIndexPayload) => {
    try {
        /* 
         idx: is a convention for redis index
        */
        const idxKey = `idx:${payload.type}`;

        // Get the list of existing indexes
        const indexes = await RedisClient.call('FT._LIST');
        console.log({ indexes });
        if (Array.isArray(indexes) && indexes.includes(idxKey)) {
            console.log("Index already exists");
            return;
        }

        const schemaFields = formatSchemaFields(payload.schema);

        const res = await RedisClient.call(
            'FT.CREATE', idxKey,
            'ON', 'JSON',
            'PREFIX', '1', idxKey,
            'SCHEMA',
            ...schemaFields
        );
        console.log({ res });
        console.log(`${payload.type} index created successfully`);
    } catch (err: any) {
        console.log({ err });
        if (err.message && err.message.includes('Index already exists')) {
            console.log("Index already exists");
        } else {
            console.error("Error creating index:", err);
            throw err;
        }
    }
}

const deleteIndex = async (type: ESessionType) => {
    const idxKey = `idx:${type}`;
    await RedisClient.call('FT.DROP', idxKey);
    console.log(`${type} index deleted successfully`);
}

export const IndexManageServices = {
    createIndex,
    deleteIndex
}