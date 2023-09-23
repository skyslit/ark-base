import { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const SALT_WORK_FACTOR = 10;
const AccountSchema = new Schema(
  {
    email: {
      type: String,
      required: false,
      defaultValue: "",
    },
    name: {
      type: String,
      required: false,
      defaultValue: "",
    },
    password: {
      type: String,
      required: false,
      defaultValue: "",
    },
    groupId: {
      type: [String],
      required: false,
      defaultValue: "",
    },
    tenantId: {
      type: String,
      required: false,
      defaultValue: "",
    },
    haveDashboardAccess: {
      type: Boolean,
      required: false,
      defaultValue: false,
    }
  },
  {
    timestamps: {
      createdAt: "createdAt",
    },
  }
);

AccountSchema.pre("save", function (this: any, next) {
  const user = this;
  if (user.isModified("password") === true) {
    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
      if (err) return next(err);
      // hash the password using our new salt
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        // override the cleartext password with the hashed one
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});
AccountSchema.methods.verifyPassword = function (
  this: any,
  password: string,
  cb: (err: Error, isMatch?: boolean) => void
) {
  bcrypt.compare(password, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};
export default AccountSchema;
