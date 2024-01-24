import express from "express";
import {
  smsSender,
  smsSenderWithMessagingService
} from "../controllers/sender.controller.js";

const router = express.Router();

router.post("/sms", smsSender);

router.post("/messagingSid", smsSenderWithMessagingService);

export default router;
