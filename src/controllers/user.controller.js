import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import { User } from '../models/user.model.js'


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

const existedUser =  User.findOne({$or: [{ username }, { email }]})

if (existedUser) {
  throw new ApiError('User already exists', 409)
}
  //  res.status(200).json({
  //   message: "hey"
  // })
})

export {registerUser}


