import ErrorHandler from "../middlewares/error.js";
import nodemailer from "nodemailer";
import { v2 as cloudinary } from "cloudinary";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";

const uploadFileToCloudinary = async (file, folder,fileName, quality) => {
    const options = { folder };
    options.resource_type = "auto";
    if (quality) {
      options.quality = quality;
    }
    if (fileName) {
        options.public_id = fileName;
    }
    // console.log("file.tempFilePath:", file.tempFilePath);
    try {
      const result = await cloudinary.uploader.upload(file.tempFilePath, options);
      console.log(`${options.resource_type} uploaded successfully`, result);
      return result;
    } catch (error) {
      console.log(`Error uploading ${options.resource_type}`, error);
      throw error;
    }
};

export const postApplication = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  const user = req.user;

//   console.log(user);

  if (role === "Employer") {
    return next(
      new ErrorHandler("Employer not allowed to access this resource.", 400)
    );
  }
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Resume File Required!", 400));
  }

  const { resume } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp","image/jpg"];
  if (!allowedFormats.includes(resume.mimetype)) {
    return next(
      new ErrorHandler("Invalid file type. Please upload a PNG file.", 400)
    );
  }

  const fileName = `${req.user._id}-${user.name}-${Date.now()}`;
  const cloudinaryResponse = await uploadFileToCloudinary(resume, "CarrerLink",fileName);

  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse.error || "Unknown Cloudinary error"
    );
    return next(new ErrorHandler("Failed to upload Resume to Cloudinary", 500));
  }
  const { name, email,  phone, coverLetter, address, jobId } = req.body  ;
  const applicantID = {
    user: req.user._id,
    role: "Job Seeker",
  };
  if (!jobId) {
    return next(new ErrorHandler("Job not found!", 404));
  }
  const jobDetails = await Job.findById(jobId);
  if (!jobDetails) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  const employerID = {
    user: jobDetails.postedBy,
    role: "Employer",
  };
  if (
    !name ||
    !email ||
    !coverLetter ||
    !phone ||
    !address ||
    !applicantID ||
    !employerID ||
    !resume
  ) {
    return next(new ErrorHandler("Please fill all fields.", 400));
  }
  const application = await Application.create({
    name,
    email,
    coverLetter,
    phone,
    address,
    applicantID,
    employerID,
    resume: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });
  console.log(application);
  res.status(200).json({
    success: true,
    message: "Application Submitted!",
    application,
  });
});

export const employerGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Job Seeker") {
      return next(
        new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
      );
    }
    const { _id } = req.user;
    const applications = await Application.find({ "employerID.user": _id });
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const jobseekerGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employer not allowed to access this resource.", 400)
      );
    }
    const { _id } = req.user;
    const applications = await Application.find({ "applicantID.user": _id });
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const jobseekerDeleteApplication = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employer not allowed to access this resource.", 400)
      );
    }
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) {
      return next(new ErrorHandler("Application not found!", 404));
    }
    await application.deleteOne();
    res.status(200).json({
      success: true,
      message: "Application Deleted!",
    });
  }
);


export const changeApplicationStatusAccepted = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Job Seeker") {
      return next(
        new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
      );
    }

    const { id } = req.params;
    let appli = await Application.findById(id);
    if (!appli) {
      return next(new ErrorHandler("OOPS! Application not found.", 404));
    }

    appli.applicationStatus = "accepted";
    await appli.save();

    const mailID = appli.email;

    try{
      // console.log("ab accept hona bhai");

      let transporter = nodemailer.createTransport({
          host: process.env.MAIL_HOST,
          auth:{
              user : process.env.MAIL_USER,
              pass : process.env.MAIL_PASS,
          }
      })


      let info = await transporter.sendMail({
          from:`Deepak Reswal`,
          to:mailID,
          subject:"Job-update-msg",
          html:`<h2>Hello ! </h2><p>Accepted </p>`
      })
      console.log("info : " , info);
      console.log("mail send successfully");
    }
    catch(e) {
        console.log(e);
    }


    res.status(200).json({
      success: true,
      message: "Application Accepted!",
    });
  }
);

export const changeApplicationStatusRejected = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Job Seeker") {
      return next(
        new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
      );
    }

    const { id } = req.params;
    let appli = await Application.findById(id);
    if (!appli) {
      return next(new ErrorHandler("OOPS! Application not found.", 404));
    }

    appli.applicationStatus = "rejected";
    await appli.save();

    const mailID = appli.email;

    try{
      // console.log("ab accept hona bhai");

      let transporter = nodemailer.createTransport({
          host: process.env.MAIL_HOST,
          auth:{
              user : process.env.MAIL_USER,
              pass : process.env.MAIL_PASS,
          }
      })


      let info = await transporter.sendMail({
          from:`Deepak Reswal`,
          to:mailID,
          subject:"Job-update-msg",
          html:`<h2>Hello ! </h2><p>Rejected </p>`
      })
      console.log("info : " , info);
      console.log("mail send successfully");
    }
    catch(e) {
        console.log(e);
    }

    res.status(200).json({
      success: true,
      message: "Application Rejected!",
    });
  }
);
