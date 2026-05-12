import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    defaultCurrency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },
    brandName: {
      type: String,
      trim: true,
    },
    logoUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

//hash password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

//compare password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

//generate token
userSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_SECRET_EXPIRY,
    },
  );
};

const userModel = mongoose.model("User", userSchema);

export default userModel;
