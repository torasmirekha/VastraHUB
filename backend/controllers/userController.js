import validator from "validator";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary"
import path from 'path'


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

// Route for user login
const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exists" })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {

            const token = createToken(user._id)
            res.json({ success: true, token })

        }
        else {
            res.json({ success: false, message: 'Invalid credentials' })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Route for user register
const registerUser = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        // checking user already exists or not
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }

        // validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save()

        const token = createToken(user._id)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        
        const {email,password} = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password,process.env.JWT_SECRET);
            res.json({success:true,token})
        } else {
            res.json({success:false,message:"Invalid credentials"})
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}


export { loginUser, registerUser, adminLogin }

const getMe = async (req, res) => {
    try {
        const { userId } = req.body
        const user = await userModel.findById(userId).select('name email avatarUrl address addresses')
        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }
        res.json({ success: true, user })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

const updateMe = async (req, res) => {
    try {
        const { userId, name } = req.body
        const file = req.file

        const update = { $set: {} }
        if (name) update.$set.name = name

        const addrFields = ['firstName','lastName','email','street','city','state','zipcode','country','phone']
        const addr = {}
        addrFields.forEach(k=>{ if (req.body[k] !== undefined && String(req.body[k]).trim() !== '') addr[k] = req.body[k] })
        if (Object.keys(addr).length > 0) {
            update.$set.address = addr
            update.$push = { addresses: addr }
        }

        if (file) {
            try {
                const result = await cloudinary.uploader.upload(file.path, { resource_type: 'image' })
                update.$set.avatarUrl = result.secure_url
            } catch (e) {
                const hostHeader = req.get('host') || req.headers.host || 'localhost:4000'
                const protocol = req.protocol || 'http'
                const base = `${protocol}://${hostHeader}`
                const rel = path.relative(process.cwd(), file.path).replace(/\\/g,'/')
                update.$set.avatarUrl = `${base}/${rel}`
            }
        }

        const user = await userModel.findByIdAndUpdate(userId, update, { new: true }).select('name email avatarUrl address addresses')
        res.json({ success: true, user })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

export { getMe, updateMe }