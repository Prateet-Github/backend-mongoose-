import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'


const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user  = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken =  user.generateRefreshToken()

   user.refreshToken = refreshToken  // save refresh token in user model or database
   await user.save({validateBeforeSave: false}) // save refresh token in db

   return { accessToken, refreshToken } // return both tokens 
   

  } catch (error) {
    
    throw new ApiError('Token generation failed', 500);
    
  }
}

const registerUser = asyncHandler( async (req,res) => {

// get user detials from frontend
// validation from frontend
// check if user already exists email or username
// chect for images, check for avatar
// upload them to cloudinary, avatar
// create user obeject - create entry in db 
// remove password and refresh token field from response
// check for suer creation
// return response

const {username, email, password, fullName} = req.body
console.log("email:", email);

if ([username, email, password, fullName].some((field) => field?.trim() === '')) {
  throw new ApiError('All fields are required', 400)
}

const existedUser = await User.findOne({$or: [{ username }, { email }]})

if (existedUser) {
  throw new ApiError('User already exists', 409)
}


const avatarLocalPath =  req.files?.avatar[0]?.path  
const coverImageLocalPath = req.files?.coverImage[0]?.path

if (!avatarLocalPath) {
  throw new ApiError('Avatar is required', 400)
}

const avatar =  await uploadOnCloudinary(avatarLocalPath)
const coverImage =  await uploadOnCloudinary(coverImageLocalPath)

if (!avatar) {
  throw new ApiError('Avatar upload failed', 500)
  
}
 const user = await User.create({
  email,
  password,
  username : username,
  fullName,
  avatar: avatar.url ,
  coverImage: coverImage?.url || "" // optional if coverimage then url if bot then empty string to tackle any error
 })

const createdUser = await User.findById(user._id).select('-password -refreshToken') // remove password and refresh token from response

if (!createdUser) {  // remove local files
  throw new ApiError('User creation failed', 500)
}

return res.status(201).json(
  new ApiResponse (200, 'User created successfully', createdUser)
  // message: 'User created successfully',
  // data: createdUser
  // success: true
  // status: 201
)

//  res.status(200).json({
  //   message: "hey"
  // })
})

const loginUser = asyncHandler( async (req,res) => {
  //req body -> data
  // user name or email access
  // find user
  // check for password
  // generate access token
  // generate refresh token
  // send response/cookies

  const {email,username, password} = req.body
  console.log("email:", email);

  if (!(username || email)) { // check if username or email is present
    throw new ApiError('At least Username or email is required', 400)
  }
  
  const user = await User.findOne({$or: [{ username }, { email }]})
  if (!user) {
    throw new ApiError('User not found', 404)
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password)
  if (!isPasswordCorrect) {
    throw new ApiError('Invalid password', 401)
  }

  const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id) // generate access and refresh token

  const loggedInUser = await User.findById(user._id).select('-password -refreshToken') // remove password and refresh token from response

  const cookieOptions = { // cookie options
    httpOnly: true,
    secure: true
  
  }

  return res  // send response with cookies
    .status(200)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200, 
        {
        user: loggedInUser, accessToken,refreshToken
      },
      'User logged in successfully'
      )
    )
})

const logoutUser = asyncHandler( async (req,res) => {
  // remove refresh token from user model
  // remove cookies
  // send response


  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 } // remove refresh token from user model
    },
    {
      new: true // return updated user
    } 
  )
const cookieOptions = { // cookie options
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .clearCookie('accessToken', cookieOptions) // clear access token cookie
    .clearCookie('refreshToken', cookieOptions) // clear refresh token cookie
    .json(
      new ApiResponse(200,{}, 'User logged out successfully')
    )
  
})

const refreshAccessToken = asyncHandler ( async (req,res) => {

const incomingRefreshToken = req.body.refreshToken ||refreshToken // get refresh token from cookies
if (!incomingRefreshToken) {
  throw new ApiError('Refresh token is required', 401)
}

try {
  const decodedToken =  jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET) // verify refresh token
  
  const user = await User.findById(decodedToken.id) // find user by id
  
  if (!user) {
    throw new ApiError('Invalid refresh token', 401)}
  
    if (incomingRefreshToken !== user?.refreshToken) { // if refresh token is not same as user refresh token
      throw new ApiError('Refresh Toke is expired or used', 401)
      
    }
  
  const cookieOptions = { // cookie options
    httpOnly: true,
    secure: true  
  }
  
  const {accessToken,newRefreshToken} =  await generateAccessTokenAndRefreshToken(user._id) // generate new access and refresh token
  
  return res
    .status(200)
    .cookie('accessToken', accessToken, cookieOptions) // set new access token cookie
    .cookie('refreshToken', newRefreshToken, cookieOptions) // set new refresh token cookie
    .json(
      new ApiResponse(
        200,
         {accessToken, refreshToken : newRefreshToken},
          'Access token refreshed successfully')
    )
  
} catch (error) { 
  throw new ApiError('Invalid refresh token', 401)
  
}
})

const changeCurrentPassword = asyncHandler( async (req,res) => {
  // get user id from req.user
  // get current password from req.body
  // check if current password is correct
  // update password
  // send response

  const {oldPassword, newPassword} = req.body

  const user = await User.findById(req.user._id)

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordCorrect) {
    throw new ApiError('Invalid current password', 400)
  }

  user.password = newPassword // update password
  await user.save({validateBeforeSave:  false})  // save user with new password

  return res.status(200).json(
    new ApiResponse(200, {}, 'Password changed successfully')
  )
})

const getCurrentUser = asyncHandler( async (req,res) => {
 
  return res.status(200).json(
    new ApiResponse(200, req.user, 'Current User fetched successfully')
  )
})

const updateAccountDetails = asyncHandler( async (req,res) => {
  // get user id from req.user
  // get user details from req.body
  // update user details
  // send response

  const { email, fullName} = req.body

  if(!email || !fullName) {
    throw new ApiError('Email and full name are required', 400)
  }

    const user = await User.findByIdAndUpdate(

    req.user?._id,
    {
     $set: { email : email, fullName } // update email and full name
    },
    {
      new: true,
      
    }
  ).select('-password') // remove password and refresh token from response

  return res.status(200).json(
    new ApiResponse(200, user, 'User updated successfully')
  )
})

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    //TODO: delete old image - assignment

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    //TODO: delete old image - assignment


    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )
})

export {registerUser}
export {loginUser}
export {logoutUser}
export {refreshAccessToken}
export {changeCurrentPassword}
export {getCurrentUser}
export {updateAccountDetails}
export {generateAccessTokenAndRefreshToken}
export {updateUserAvatar}
export {updateUserCoverImage}