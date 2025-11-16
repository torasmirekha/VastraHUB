import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const NewsletterBox = () => {

    const [email,setEmail] = useState('')
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(backendUrl + '/api/subscriber/add', { email })
            if (response.data.success) {
                toast.success(response.data.message)
                setEmail('')
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

  return (
    <div className=' text-center'>
      <p className='text-2xl font-medium text-gray-800'>Subscribe now & get 20% off</p>
      <p className='text-gray-400 mt-3'>
      Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
      </p>
      <form onSubmit={onSubmitHandler} className='w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3'>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} className='w-full sm:flex-1 outline-none' type="email" placeholder='Enter your email' required/>
        <button type='submit' className='bg-black text-white text-xs px-10 py-4'>SUBSCRIBE</button>
      </form>
    </div>
  )
}

export default NewsletterBox
