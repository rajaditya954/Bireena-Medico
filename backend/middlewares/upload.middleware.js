import multer from "multer";
import path from "path";
import fs from "fs";

const createUploadDirectory = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const reportStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/reports";
    createUploadDirectory(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const prescriptionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/prescriptions";
    createUploadDirectory(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const invoiceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/invoices";
    createUploadDirectory(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF and image files are allowed."), false);
  }
};

export const uploadReport = multer({ storage: reportStorage, fileFilter });
export const uploadPrescription = multer({ storage: prescriptionStorage, fileFilter });
export const uploadInvoice = multer({ storage: invoiceStorage, fileFilter });
