import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Dashboard = () => {

  const { backendUrl, token, currency } = useContext(ShopContext)
  const [tab,setTab] = useState('overview')
  const [user,setUser] = useState({ name:'', email:'', avatarUrl:'' })
  const [orderData,setOrderData] = useState([])
  const [name,setName] = useState('')
  
  
  const [address,setAddress] = useState({ firstName:'', lastName:'', email:'', street:'', city:'', state:'', zipcode:'', country:'', phone:'' })
  const [addresses,setAddresses] = useState([])

  const loadMe = async () => {
    try {
      if (!token) return
      const response = await axios.get(backendUrl + '/api/user/me',{ headers:{ token } })
      if (response.data.success) {
        const u = response.data.user || { name:'', email:'', avatarUrl:'' }
        setUser(u)
        setName(u.name || '')
        const a = u.address || {}
        setAddress({
          firstName: a.firstName || '',
          lastName: a.lastName || '',
          email: a.email || (u.email || ''),
          street: a.street || '',
          city: a.city || '',
          state: a.state || '',
          zipcode: a.zipcode || '',
          country: a.country || '',
          phone: a.phone || ''
        })
        setAddresses(Array.isArray(u.addresses) ? u.addresses : (a ? [a] : []))
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const loadOrders = async () => {
    try {
      if (!token) return
      const response = await axios.post(backendUrl + '/api/order/userorders',{},{headers:{token}})
      if (response.data.success) {
        let allItems = []
        response.data.orders.map((order)=>{
          order.items.map((item)=>{
            item['status'] = order.status
            item['payment'] = order.payment
            item['paymentMethod'] = order.paymentMethod
            item['date'] = order.date
            allItems.push(item)
          })
        })
        setOrderData(allItems.reverse())
      }
    } catch (error) {
      console.log(error)
    }
  }

  const saveProfile = async (e) => {
    try {
      if (e && e.preventDefault) e.preventDefault()
      const form = new FormData()
      form.append('name', name)
      Object.entries(address).forEach(([k,v])=> { if (String(v||'').trim() !== '') form.append(k, v) })
      const response = await axios.post(backendUrl + '/api/user/update', form, { headers:{ token } })
      if (response.data.success) {
        toast.success('Profile updated')
        const updated = response.data.user || {}
        setUser(updated)
        setAddresses(Array.isArray(updated.addresses) ? updated.addresses : [])
        setTab('addresses')
        
        await loadMe()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  

  useEffect(() => { loadMe(); loadOrders() }, [token])

  const totalOrders = orderData.length
  const delivered = orderData.filter(i => String(i.status).toLowerCase().includes('delivered')).length
  const pending = totalOrders - delivered

  return (
    <div className='min-h-screen bg-gray-50 flex'>
      <div className='w-[240px] bg-white border-r'>
        <div className='p-4 flex items-center gap-3 border-b'>
          <div>
            <p className='font-semibold'>{(user && user.name) ? user.name : 'User'}</p>
            <p className='text-xs text-gray-500'>{(user && user.email) ? user.email : ''}</p>
          </div>
        </div>
        <div className='flex flex-col p-2'>
          <button onClick={()=>setTab('overview')} className={`text-left px-3 py-2 rounded ${tab==='overview' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>Overview</button>
          <button onClick={()=>setTab('orders')} className={`text-left px-3 py-2 rounded ${tab==='orders' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>Orders</button>
          <button onClick={()=>setTab('addresses')} className={`text-left px-3 py-2 rounded ${tab==='addresses' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>Saved Addresses</button>
          <button onClick={()=>setTab('profile')} className={`text-left px-3 py-2 rounded ${tab==='profile' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>Profile</button>
        </div>
      </div>

      <div className='flex-1 p-6'>
        {tab==='overview' && (
          <div>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
              <div className='bg-white border rounded-xl p-5 shadow-sm'>
                <p className='text-sm text-gray-500'>Total Orders</p>
                <p className='text-3xl font-semibold mt-2'>{totalOrders}</p>
              </div>
              <div className='bg-white border rounded-xl p-5 shadow-sm'>
                <p className='text-sm text-gray-500'>Delivered</p>
                <p className='text-3xl font-semibold mt-2 text-green-600'>{delivered}</p>
              </div>
              <div className='bg-white border rounded-xl p-5 shadow-sm'>
                <p className='text-sm text-gray-500'>Pending</p>
                <p className='text-3xl font-semibold mt-2 text-amber-600'>{pending}</p>
              </div>
            </div>

            <div className='bg-white border rounded-xl p-5 shadow-sm mb-6 flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div>
                  <p className='font-semibold'>{(user && user.name) || ''}</p>
                  <p className='text-gray-500 text-sm'>{(user && user.email) || ''}</p>
                </div>
              </div>
              <div className='flex gap-3'>
                <button onClick={()=>setTab('orders')} className='px-4 py-2 border rounded hover:bg-gray-100'>View Orders</button>
                <button onClick={()=>setTab('profile')} className='px-4 py-2 bg-black text-white rounded'>Edit Profile</button>
              </div>
            </div>

            <div className='bg-white border rounded-xl p-5 shadow-sm'>
              <p className='font-medium mb-3'>Recent Items</p>
              {orderData.slice(0,5).map((item,idx)=> (
                <div key={idx} className='grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 p-2 border rounded mb-2 text-sm'>
                  <div className='flex items-center gap-3'>
                    <img className='w-10 h-10 object-cover' src={item.image?.[0]} alt='' />
                    <p className='line-clamp-1'>{item.name}</p>
                  </div>
                  <p>{currency}{item.price}</p>
                  <p>{item.status}</p>
                  <p>{new Date(item.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='orders' && (
          <div>
            <div className='hidden md:grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 p-2 bg-gray-100 border text-sm'>
              <b>Item</b><b>Price</b><b>Status</b><b>Date</b>
            </div>
            {orderData.map((item,idx)=> (
              <div key={idx} className='grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 p-2 border text-sm'>
                <div className='flex items-center gap-3'>
                  <img className='w-12 h-12 object-cover' src={item.image?.[0]} alt='' />
                  <p>{item.name}</p>
                </div>
                <p>{currency}{item.price}</p>
                <p>{item.status}</p>
                <p>{new Date(item.date).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        {tab==='addresses' && (
          <div className='bg-white border rounded-xl p-5 shadow-sm'>
            <p className='font-medium mb-3'>Saved Addresses</p>
            {addresses.length === 0 && (
              <p className='text-sm text-gray-500'>No saved addresses yet. Add one in Profile.</p>
            )}
            <div className='grid sm:grid-cols-2 gap-4'>
              {addresses.map((addr, idx) => (
                <div key={idx} className='border rounded p-3 text-sm'>
                  <p className='font-medium'>{[addr.firstName, addr.lastName].filter(Boolean).join(' ')}</p>
                  <p className='text-gray-600'>{addr.street}</p>
                  <p className='text-gray-600'>{[addr.city, addr.state, addr.zipcode].filter(Boolean).join(', ')}</p>
                  <p className='text-gray-600'>{addr.country}</p>
                  <div className='mt-1 text-gray-500'>
                    <p>{addr.phone}</p>
                    <p>{addr.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='profile' && (
          <form onSubmit={saveProfile} className='max-w-xl bg-white border rounded-xl p-5 shadow-sm'>
            
            <div className='grid sm:grid-cols-2 gap-4'>
              <div>
                <p className='text-sm mb-1'>Name</p>
                <input value={name} onChange={(e)=>setName(e.target.value)} className='w-full px-3 py-2 border rounded' />
              </div>
              <div>
                <p className='text-sm mb-1'>Email</p>
                <input value={(user && user.email) || ''} disabled className='w-full px-3 py-2 border rounded bg-gray-100' />
              </div>
            </div>
            <div className='mt-6'>
              <p className='font-medium mb-2'>Saved Address</p>
              <div className='grid sm:grid-cols-2 gap-4'>
                <input placeholder='First name' value={address.firstName} onChange={(e)=>setAddress(a=>({...a,firstName:e.target.value}))} className='w-full px-3 py-2 border rounded' />
                <input placeholder='Last name' value={address.lastName} onChange={(e)=>setAddress(a=>({...a,lastName:e.target.value}))} className='w-full px-3 py-2 border rounded' />
                <input placeholder='Street' value={address.street} onChange={(e)=>setAddress(a=>({...a,street:e.target.value}))} className='w-full px-3 py-2 border rounded sm:col-span-2' />
                <input placeholder='City' value={address.city} onChange={(e)=>setAddress(a=>({...a,city:e.target.value}))} className='w-full px-3 py-2 border rounded' />
                <input placeholder='State' value={address.state} onChange={(e)=>setAddress(a=>({...a,state:e.target.value}))} className='w-full px-3 py-2 border rounded' />
                <input placeholder='Zipcode' value={address.zipcode} onChange={(e)=>setAddress(a=>({...a,zipcode:e.target.value}))} className='w-full px-3 py-2 border rounded' />
                <input placeholder='Country' value={address.country} onChange={(e)=>setAddress(a=>({...a,country:e.target.value}))} className='w-full px-3 py-2 border rounded' />
                <input placeholder='Phone' value={address.phone} onChange={(e)=>setAddress(a=>({...a,phone:e.target.value}))} className='w-full px-3 py-2 border rounded' />
              </div>
            </div>
            <button className='mt-6 px-4 py-2 bg-black text-white rounded'>Save changes</button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Dashboard