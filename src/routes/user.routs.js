import { Router } from "express";
import { userRegister , 
    userLoggedIn,
    userLoggedOut,
    regeneratingTokens, 
    changeCurrentPassword, 
    getCurrentUser ,   
    updateUserInformation, 
    updateUserAvatar, 
    updateCoverImage,
    getUserChannelProfile } from "../controllers/user.controllers.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        { 
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    userRegister
    )

router.route("/login").post(userLoggedIn)

//  secure routes
router.route("/logout").post(
     verifyJWT,
     userLoggedOut
)

router.route("/regenerating-tokens").post(
    verifyJWT,
    regeneratingTokens
)

router.route("/password").post(
    verifyJWT,
    changeCurrentPassword
)

router.route("/current-user").post(
    verifyJWT,
    getCurrentUser,

)

router.route("/update-user-info").post(
    verifyJWT,
    updateUserInformation,

)

router.route("/update-profile").post(
    verifyJWT,
    upload.single("avatar"),
    updateUserAvatar
)

router.route("/update-cover-image").post(
    verifyJWT,
    upload.single("coverImage"),
    updateCoverImage
)

router.route("/username").post(    
    getUserChannelProfile
)


export default router;