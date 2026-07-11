import {Router} from "express";
import {login,register} from '../controller/user.controller.js'

const router = Router()

router.route("/login").post(login)
router.route("/register").post(register)
router.route("/add-to-activity")
router.route("/get-all-activity")

export default router