import { Router } from "express"
import {changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, logoutUser, refreshAccessToken, updateUserAvatar, updateUserCoverImage} from "../controllers/user.controller.js" // import user controller
import {registerUser} from "../controllers/user.controller.js" // import user controller
import {upload} from "../middlewares/multer.middleware.js" // import multer middleware
import {verifyJWT} from "../middlewares/auth.middleware.js" // import auth middleware
import {loginUser} from "../controllers/user.controller.js" // import user controller
import { get } from "http"

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

router.route('/change-password').post(verifyJWT,changeCurrentPassword )// change password route secure route

router.route('/current-user').get(verifyJWT, getCurrentUser) // get current user route secure route

router.route('/avatar').patch(verifyJWT, upload.single('avatar'), updateUserAvatar) // update user avatar route secure route

router.route('/cover-image').patch(verifyJWT, upload.single('coverImage'), updateUserCoverImage) // update user cover image route secure route

router.route('/c/:username').get(verifyJWT, getUserChannelProfile) // get user channel profile route secure route

router.route('/history').get(verifyJWT,getWatchHistory) // get watch history route secure route





export default router
