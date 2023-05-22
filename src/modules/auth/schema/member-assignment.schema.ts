import { Schema } from 'mongoose';

const MemberAssignmentSchema = new Schema(
    {
        userId: {
            type: String,
            required: false,
            defaultValue: "",
        },
        groupId: {
            type: String,
            required: false,
            defaultValue: "",
        },
        count: {
            type: Number,
            required: false,
            defaultValue:0,
        }
    },
    {
        timestamps: {
            createdAt: 'createdAt',
        },
    }
);

export default MemberAssignmentSchema;