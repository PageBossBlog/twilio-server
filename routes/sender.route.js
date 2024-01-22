import express from "express";
import {
  smsSender
} from "../controllers/sender.controller.js";

const router = express.Router();

router.post("/sms", smsSender);

export default router;