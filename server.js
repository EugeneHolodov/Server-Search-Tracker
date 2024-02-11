import express from "express";
import multer from "multer";
import cors from "cors";
import mongoose from "mongoose";
import {
  registerValidation,
  loginValidation,
  cardCreateValidation,
  cardUpdateValidation,
} from "./validations.js";
import { checkAuth, handleValidationErrors } from "./utils/index.js";
import {
  UserController,
  CardController,
  QuestionController,
} from "./controllers/index.js";

mongoose
  .connect(
    "mongodb+srv://Yevhenii:ZyKaM8eVyFJSGgSi@cluster0.ezmvihc.mongodb.net/jobSearchTracker?retryWrites=true&w=majority"
  )
  .then(() => console.log("DB ok"))
  .catch((err) => console.log("DB erorr", err));

const app = express();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, "uploads");
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

const port = 4444;
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.post(
  "/auth/login",
  loginValidation,
  handleValidationErrors,
  UserController.register
);
app.post(
  "/auth/register",
  registerValidation,
  handleValidationErrors,
  UserController.login
);
app.get("/auth/me", checkAuth, UserController.getMe);

app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  res.json({
    url: `/upload/${req.file.originalname}`,
  });
});

app.get("/cards", checkAuth, CardController.getAll);
app.get("/cards/:id", checkAuth, CardController.getOne);
app.post(
  "/cards",
  checkAuth,
  cardCreateValidation,
  handleValidationErrors,
  CardController.create
);
app.delete("/cards/:id", checkAuth, CardController.remove);
app.patch(
  "/cards/:id",
  checkAuth,
  cardUpdateValidation,
  handleValidationErrors,
  CardController.update
);
app.patch(
  "/cards",
  checkAuth,
  handleValidationErrors,
  CardController.updateCards
);

app.post(
  "/questions",
  checkAuth,
  handleValidationErrors,
  QuestionController.create
);
app.get("/questions", checkAuth, QuestionController.getAll);

app.delete("/questions/:id", checkAuth, QuestionController.remove);

app.patch(
  "/questions/:id",
  checkAuth,
  handleValidationErrors,
  QuestionController.update
);

app.listen(port, (error) => {
  if (error) {
    return console.log(`Error: ${error}`);
  }
  console.log(`Сервер запущен на порту ${port}`);
});
