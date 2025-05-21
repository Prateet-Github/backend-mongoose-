import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'


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
const coverImageLocalPath =  req.files?.coverImage[0]?.path

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

export {registerUser}