import express from 'express';
import { loginUser,registerUser,adminLogin, getMe, updateMe } from '../controllers/userController.js';
import authUser from '../middleware/auth.js'
import upload from '../middleware/multer.js'

const userRouter = express.Router();

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.post('/admin',adminLogin)
userRouter.get('/me',authUser,getMe)
userRouter.post('/update',authUser,upload.single('avatar'),updateMe)

export default userRouter;