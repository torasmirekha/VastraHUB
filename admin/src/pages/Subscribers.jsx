import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Subscribers = ({ token }) => {

  const [subs, setSubs] = useState([])
  const [showMsg,setShowMsg] = useState(false)
  const [toEmail,setToEmail] = useState('')
  const [subject,setSubject] = useState('')
  const [body,setBody] = useState('')

  const fetchSubs = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/subscriber/list', { headers: { token } })
      if (response.data.success) {
        setSubs(response.data.subscribers)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => { fetchSubs() }, [])

  return (
    <div>
      <p className='mb-2'>Subscribers</p>
      <div className='flex flex-col gap-2'>
        <div className='hidden md:grid grid-cols-[2fr_2fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
          <b>Email</b>
          <b>Date</b>
        </div>
        {
          subs.map((item, index) => (
            <div key={index} className='grid grid-cols-[2fr_2fr] md:grid-cols-[2fr_2fr_1fr] items-center gap-2 py-1 px-2 border text-sm'>
              <p>{item.email}</p>
              <p>{new Date(item.date).toLocaleString()}</p>
              <button onClick={()=>{setToEmail(item.email); setSubject('Greetings from VastraHUB'); setBody('Thank you for subscribing to VastraHUB.'); setShowMsg(true)}} className='px-2 py-1 border rounded'>Message</button>
            </div>
          ))
        }
      </div>

      { showMsg && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
          <form onSubmit={async (e)=>{
            e.preventDefault();
            try {
              const response = await axios.post(backendUrl + '/api/subscriber/message',{ email: toEmail, subject, message: body},{headers:{token}})
              if (response.data.success) {
                toast.success(response.data.message)
                setShowMsg(false)
              } else {
                toast.error(response.data.message)
              }
            } catch (error) {
              console.log(error)
              toast.error(error.message)
            }
          }} className='bg-white p-5 rounded w-[90%] max-w-[600px]'>
            <p className='text-lg mb-3'>Send Message</p>
            <input value={toEmail} onChange={(e)=>setToEmail(e.target.value)} className='w-full px-3 py-2 border mb-2' type='email' placeholder='Recipient email' required/>
            <input value={subject} onChange={(e)=>setSubject(e.target.value)} className='w-full px-3 py-2 border mb-2' placeholder='Subject' required/>
            <textarea value={body} onChange={(e)=>setBody(e.target.value)} className='w-full px-3 py-2 border h-32' placeholder='Write your message...' required/>
            <div className='flex justify-end gap-3 mt-3'>
              <button type='button' onClick={()=>setShowMsg(false)} className='px-4 py-2 border rounded'>Cancel</button>
              <button type='submit' className='px-4 py-2 bg-black text-white rounded'>Send</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Subscribers