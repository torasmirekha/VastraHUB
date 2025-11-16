import express from 'express'
import { addSubscriber, listSubscribers, messageSubscriber } from '../controllers/subscriberController.js'
import adminAuth from '../middleware/adminAuth.js'

const subscriberRouter = express.Router()

subscriberRouter.post('/add', addSubscriber)
subscriberRouter.get('/list', adminAuth, listSubscribers)
subscriberRouter.post('/message', adminAuth, messageSubscriber)

export default subscriberRouter