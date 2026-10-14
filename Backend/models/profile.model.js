import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  dob: {
    type: Date,
  },
  skills: [
    {
      type: String,
      trim: true,
    },
  ],
  education: [{
    type: String,
    trim: true,
  }],
  experience: [
    {
      company: {
        type: String,
        trim: true,
      },

      position: {
        type: String,
        trim: true,
      },

      startDate: {
        type: Date,
      },

      endDate: {
        type: Date,
      },

      description: {
        type: String,
        trim: true,
      },
    },
  ],

  projects: [
    {
      title: {
        type: String,
        trim: true,
      },

      description: {
        type: String,
        trim: true,
      },

      technologies: [
        {
          type: String,
          trim: true,
        },
      ],

      projectUrl: {
        type: String,
        trim: true,
      },
    },
  ],

  resumeUrl: {
    type: String,
    trim: true,
  },
},{timestamps:true});

export const Profile = mongoose.model("Profile", profileSchema);
