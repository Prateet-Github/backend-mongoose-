import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export const verifyJWT = asyncHandler(async (req, _ , next) => { // auth middleware

  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "").trim() // get token from cookies or header 
    
  if (!token) {
     throw new ApiError('Unauthorised Request', 401)
    }
   
  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) // verify token
  
  const user = await User.findById(decodedToken?._id).select('-password -refreshToken') // find user by id and remove password and refresh token from response
  
  if (!user) { // if user not found
    
    throw new ApiError('Invalid Access Token', 400)
  }
  
  req.user = user ;// set user in request
  next() // call next middleware
  
  } catch (error) { // if error
    if (error.name === 'TokenExpiredError') { // if token expired
      throw new ApiError('Access Token Expired', 401)
    }
    if (error.name === 'JsonWebTokenError') { // if token is invalid
      throw new ApiError('Invalid Access Token', 401)
    }
    if (error.name === 'NotBeforeError') { // if token not active yet
      throw new ApiError('Access Token Not Active Yet', 401)
    }
    throw new ApiError('Invalid Access Token' , 401)
  }

})




