import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      // unique:true  //same company ko user baar baar na create kre
    },

    logo: {
      type: String, // Cloudinary URL
      trim: true,
    },

    about: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index:true
    },
  },
  {
    timestamps: true,
  }
);

export const Company = mongoose.model("Company", companySchema);

