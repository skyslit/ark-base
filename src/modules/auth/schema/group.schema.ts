import { Schema } from 'mongoose';

const GroupSchema = new Schema(
    {
        groupTitle: {
            type: String,
            required: false,
            defaultValue: "",
        },
        description: {
            type: String,
            required: false,
            defaultValue: "",
        },
        count: {
            type: Number,
            required: false,
            defaultValue:0,
        },
    },
    {
        timestamps: {
            createdAt: 'createdAt',
        },
    }
);

export default GroupSchema;