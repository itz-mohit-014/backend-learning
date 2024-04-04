import { ApiErrors } from "../utils/ApiErrors.js";
import { asyncHandlerWrapper } from "../utils/asyncHandler-F-ASYNC-AWAIT.js";
import jwt from "jsonwebtoken";
import { User } from "../modules/user.models.js";

export const verifyJWT = asyncHandlerWrapper(async(req, res, next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
      
    
        if(!token){
            throw new ApiErrors(401, "Unauthorized Request.")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id);

        // const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if(!user){
            // Todo: discuss about frontend at this point....
            throw new ApiErrors(401, "Invalid Access Token");
        }
    
        req.user = user;

        next();
    } catch (error) {
        throw new ApiErrors(401, error?.message || "Invalid Access Token")
    }
})