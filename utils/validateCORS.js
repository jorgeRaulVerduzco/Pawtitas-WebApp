import cors from "cors";

const allowOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : [];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Cors no incluido"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

export default corsOptions;