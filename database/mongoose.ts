import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_URI_DIRECT = process.env.MONGODB_URI_DIRECT;

if (!MONGODB_URI) throw new Error('Please define the MONGODB_URI environment variable');

declare global {
    var mongooseCache: {
        conn: typeof mongoose | null
        promise: Promise<typeof mongoose> | null
    }
}

let cached = global.mongooseCache || (global.mongooseCache = { conn: null, promise: null });

const RETRYABLE_ERROR_SNIPPETS = [
    'ETIMEOUT',
    'ENOTFOUND',
    'ESERVFAIL',
    'ECONNRESET',
    'MongoServerSelectionError',
    'querySrv',
];

const isRetryableMongoError = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error ?? '');
    return RETRYABLE_ERROR_SNIPPETS.some((snippet) => message.includes(snippet));
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const createMongoConnection = async () => {
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await mongoose.connect(MONGODB_URI, {
                bufferCommands: false,
                serverSelectionTimeoutMS: 10000,
                connectTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                family: 4,
                maxPoolSize: 10,
            });
        } catch (error) {
            const retryable = isRetryableMongoError(error);

            if (!retryable || attempt === maxAttempts) {
                throw error;
            }

            const backoffMs = attempt * 1500;
            console.warn(`[mongodb] Connection attempt ${attempt} failed. Retrying in ${backoffMs}ms...`);
            await wait(backoffMs);
        }
    }

    // Optional fallback when SRV DNS is unstable on local ISP/router DNS.
    if (MONGODB_URI_DIRECT) {
        console.warn('[mongodb] Falling back to MONGODB_URI_DIRECT after SRV resolution retries.');
        return mongoose.connect(MONGODB_URI_DIRECT, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4,
            maxPoolSize: 10,
        });
    }

    throw new Error('MongoDB connection retries exhausted');
};

export const connectToDatabase = async () => {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = createMongoConnection();
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error('MongoDB connection error (Atlas/DNS/network). ' + e);
        throw e;
    }

    console.info('Connected to MongoDB');
    return cached.conn;
}
