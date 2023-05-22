import { Schema } from 'mongoose';

const AppSchema = new Schema(
    {
        accessKeyId: {
            type: String,
            required: false,
            defaultValue: "",
        },
        accessSecret: {
            type: String,
            required: false,
            defaultValue: "",
        },
        callbackUrls: {
            type: [String],
            required: false,
            defaultValue: [],
        },
        name: {
            type: String,
            required: false,
            defaultValue: "",
        },
    },
    {
        timestamps: {
            createdAt: 'createdAt',
        },
    }
);

export default AppSchema;