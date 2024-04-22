import { asyncHandlerWrapper } from "../utils/asyncHandler-F-ASYNC-AWAIT.js";
import { ApiErrors } from "../utils/ApiErrors.js"
import {ApiResponse}  from "../utils/ApiResponse.js"
import { User } from "../modules/user.models.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.service.js"
import Jwt  from "jsonwebtoken";


// generate tokens...
const generateAccessAndRefreshToken = async (userId)=>{
       try {
           // find user then generate tokens >> add to user object.
           const user = await User.findById(userId);
           
           const accessToken = await user.generateAccessToken();
           const refreshToken = await user.generateRefreshToken();
           
        //    console.log('start..')
           
        //    const accessToken = await accessT.then((token)=>{ 
        //        return token
        //     }).catch((e)=>{
        //         throw new ApiErrors(500, "Access Token is not ready to use.")
        //     })

        //    const refreshToken = await refreshT.then((token)=>{ 
        //        return token
        //     }).catch((e)=>{
        //         throw new ApiErrors(500, "Access Token is not ready to use.")
        //     })
            
           user.refreshToken = refreshToken;
   
           await user.save({
               validateBeforeSave:false
           })
   
           return {accessToken, refreshToken};
           
       } catch (error) {
           throw new ApiErrors(500, "Something went wrong while generating the Access Tokens.")
       }
}


const userRegister = asyncHandlerWrapper( async (req, res, next) => {
        // res.status(200).json({
        //     Message:"Request Approved."

        /**
         *  *****Steps to Register User*****
         * 
         * 1. Tacking User Register Details from the Frontend.
         * 
         * 2. Validate User Details :
         *      1. Required feild not be empty
         *      2. Username Unique
         *      3. email id must be valid (include '.' and '@')
         *      4. password length (strong)
         *      5. if any File (type : check)
         *  
         * 3. Check if User already Register based on credintial( email or username)
         * 
         * 3. Save User Details to DateBase.
         * 
         * 4. show success message to the user (if any rejection then show error with message
         * 
         */

        const { fullName, username, password, email} = req.body;
        // console.log("Your name is :", fullName ) // destructure come of not.

        // checked if any feild is exists using option chaining '?'
        if(
            [fullName, email, password, username].some((field)=>
            field?.trim() === "")
        ){  
            throw new ApiErrors(400, "Details is not completed.")
        }else if(!email.includes('@') || !email.includes('.')){
            throw new ApiErrors(400, "Email is not valid.")
        }else if(password.length < 8){
            throw new ApiErrors(400, "Password should be strong.")
        }   

        // User can contact to the database because its created by mongoose.
        
        const existedUser = await User.findOne({
            $or: [ { username }, { email } ]
        })  

        if(existedUser){
            throw new ApiErrors(409  , "User Already Exists")
        }

       const avatarLocalPath = req.files?.avatar?.[0]?.path;
       const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

        if(!avatarLocalPath){
            throw new ApiErrors(400, "Avtar file is required.")
        }

        const avatar = await uploadFileOnCloudinary(avatarLocalPath)
        const coverImage = await uploadFileOnCloudinary(coverImageLocalPath)

        // console.log("fle uploaded successfully on cloudinary:", avatar) // responce comes from cloudinary.

        if(!avatar){
            throw new ApiErrors(400, "Avatar is Not Uploaded Successfully.")
        }

        const user = await User.create({
            fullName, 
            password,
            email,
            username,
            avatar : avatar.url,
            coverImage : coverImage?.url || "" , 
        })
        
        // error occurs on "_Id". 
        // const createdUser = User.findById(user._Id).select(
        //     "-password -refreshToken"
        // )

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )

        if(!createdUser){
            throw new ApiErrors(500, "Something went wrong while creating the user registration.")
        }
        
        return await res.status(201).json(
            new ApiResponse(200,createdUser,"User registered successfully")
        )    

       
    } 

)

const userLoggedIn = asyncHandlerWrapper( async(req, res)=>{
    // req.body .... get data.
    // Validation:
    //    1. check data is empty or not.
    // check in database if (email or username) is already available or not.
    // match password.
    //  generate refresh and accessToken.
    const {username, email, password} = req.body
     
    if(!(username || email) && !password){
        throw new ApiErrors(409 , "Username or Password is required!");
    }

    // find user in database.
    const user = await User.findOne({
        $or:[{ email }, { username }]
    })


    if(!user){
        throw new ApiErrors(404, "User Dosen't Exits.")
    }
 
    // 'User' comes from mongoose so whateven method we add ( isPasswordCorrect ) will show in after fetch user from databasee - 'user'.

    const isValidPassword = await user.isPasswordCorrect(password)

    if(!isValidPassword){
        throw new ApiErrors(401, "Password is wrong")
    }

    let {accessToken, refreshToken}  = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select(`
        -password -refreshToken
    `)

    //  set options for cookies.
    const options = {
        httpOnly: true,
        secure:true
    }

    console.log("user\n,", req.user)

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                 user:loggedInUser, accessToken, refreshToken
            },
         "User Successfully Logged In. ")
    )
})

const userLoggedOut = asyncHandlerWrapper( async(req, res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{refreshToken:undefined}
        },
        {
            new:true
        }

    )

    const options = {
        httpOnly:true,
        secure:true
    }

    console.log(req.user)

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200 , {}, "User Logged Out")
    )
})



// need for regenerating tokens after session expired.

const regeneratingTokens = asyncHandlerWrapper(async (req, res) =>{

    // get token from the user
    //  read token details and verify that.
    //  find user based on token deitals
    // match token from the database stored and sent by user.
    // regenerate token 
    // reset to cookie and update token in database

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiErrors(401, "Unauthorised Request");
    }
    console.log(incomingRefreshToken)

    try {
        // const decodedToken = Jwt.verify(
        //     incomingRefreshToken,
        //     process.env.REFRESH_TOKEN_SECRET
        // )    
            
        // console.log(decodedToken)

        // if(!decodedToken){
        //     throw new ApiErrors(401, "Token is Invalid")
        // }
    
        // const user = await User.findById(decodedToken?._id)
        const user = req.user;
    
        if(!user){
            throw new ApiErrors(401, "User can't fount form the Token due to token expired or used.")
        }
    
        console.log("refres Token Checking....")
        console.log(user)

        if(incomingRefreshToken !== user.refreshToken){
            throw new ApiErrors(401, "Token Details is not match form the Database.")
        }
    
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);
    
        const options = {
            httpOnly:true,
            secure :true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken , options)
        .json(
            new ApiResponse(200, {
                accessToken,
                newRefreshToken
            }, "Token is regenerated successfully")
        )
    } catch (error) {
            throw new ApiErrors(401, error?.message || "Something went wrong while regenerating Access Token" )
    }

})

const changeCurrentPassword = asyncHandlerWrapper(async (req, res) =>{
    const {oldPassword, newPassword, confirmPassword} = req.body

    if(newPassword !==  confirmPassword){
        throw new ApiErrors(401, "New Password and Confirm password is mismatched.")
    }

    try {
        // console.log(req?.user, req)

        const user = req.user;
        console.log(user)
        console.log(oldPassword)
        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    
        console.log(isPasswordCorrect)

        if(!isPasswordCorrect){
            throw new ApiErrors(400, "Password is not correct");
        }
    
        user.password = newPassword;
        await user.save({validateBeforeSave:false})
    
        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password changed Successfully")
        )
    } catch (error) {
        throw new ApiErrors(409, error.message || "Something went wrong while changing password")
    }
})

const getCurrentUser = asyncHandlerWrapper(async (req, res)=>{
    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user , "Current User Fetched Successfully.")
    )
})

// text based data update
const updateUserInformation = asyncHandlerWrapper(async(req, res)=>{
    const {fullName, email} = req.body

    if(!fullName || !email){
        throw new ApiErrors(401, "All Feilds are required.")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,

        // field that will update.
        {
            
            $set:{
                fullName,
                email
            }
        },

        {new : true} // return new user after update
    ).select("-password -refreshToken") // remove password

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "All details have been updated successfully")
    )
})

// files based data update.
const updateUserAvatar = asyncHandlerWrapper(async(req, res) => {
    const avatarLocalPath = req.files?.avatar[0]?.path;
    
    console.log(avatarLocalPath, req.files);

    if(!avatarLocalPath){
        throw new ApiErrors(400, "Avatar is missing.")
    }

    const avatar = await uploadFileOnCloudinary(avatarLocalPath)

    if(!avatar){
        throw new ApiErrors(401, "Error while uploading file on cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new:true}
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar file have been uploaded successfully")
    )
    
} )


const updateCoverImage = asyncHandlerWrapper(async(req, res) => {
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!coverImageLocalPath){
        throw new ApiErrors(401, "Cover File is missing")
    }

    const coverImage = await uploadFileOnCloudinary(coverImageLocalPath);

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new:true}
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover Image have be uploaded successfully")
    )

}) 


const getUserChannelProfile = asyncHandlerWrapper(async(req, res) => {
    const { username} = req.params;
    
    console.log("To access query paramaters from the url", req.query);

    if(!username){
        throw new ApiErrors(400, "cannot get username");
    }

    const channel = await User.aggregate(
        [
            {
                $match:{
                    username: username?.toLowerCase()
                }
            },
            {
                $lookup:{
                    from:"subscriptions",
                    localField:"_id",
                    foreignField:"channel",
                    as:"subscribers",
                }
            },
            {
                $lookup:{
                    from:"subscriptions",
                    localField:"_id",
                    foreignField:"subscriber",
                    as:"subscribedTo"
                }
            },
            {
                $addFields:{
                    subscriberCount:{
                        $size:"$subscribers"
                    },

                    channelsSubscribedToCount:{
                        $size:"$subscribedTo"
                    }
                }
            },
           
        ]
    )
   

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel, "current User Fetch Successfully")
    )
})




export  {
    userRegister,
    userLoggedIn,
    userLoggedOut,
    regeneratingTokens,
    changeCurrentPassword,
    getCurrentUser,
    updateUserInformation,
    updateUserAvatar,
    updateCoverImage,
    getUserChannelProfile
};