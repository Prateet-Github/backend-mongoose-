import { Router } from "express"
import {logoutUser, refreshAccessToken} from "../controllers/user.controller.js" // import user controller
import {registerUser} from "../controllers/user.controller.js" // import user controller
import {upload} from "../middlewares/multer.middleware.js" // import multer middleware
import {verifyJWT} from "../middlewares/auth.middleware.js" // import auth middleware
import {loginUser} from "../controllers/user.controller.js" // import user controller

const router = Router() // create router instance

router.route('/register').post(  // register route
  upload.fields([
    {name: 'avatar', maxCount: 1},
    {name: 'coverImage', maxCount: 1}
  ]),
  registerUser)

router.route('/login').post(loginUser) // login route

router.route('/logout').post(verifyJWT,logoutUser) // logout route secure route

router.route('/refresh-token').post(refreshAccessToken) // refresh access token route

export default router
