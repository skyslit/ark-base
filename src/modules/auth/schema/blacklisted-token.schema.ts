import { Schema } from 'mongoose';

const BlacklistedToken = new Schema(
    {
        token: {
            type: String,
            required: true,
            index: true
        },
        iat: {
            type: String,
            required: true
        }
    },
    {
        timestamps: {
            createdAt: 'createdAt',
        },
    }
);

export default BlacklistedToken;