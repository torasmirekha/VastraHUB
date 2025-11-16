import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const List = ({ token }) => {

  const [list, setList] = useState([])
  const [showEdit,setShowEdit] = useState(false)
  const [editId,setEditId] = useState('')
  const [name,setName] = useState('')
  const [description,setDescription] = useState('')
  const [price,setPrice] = useState('')
  const [category,setCategory] = useState('Banarashi')
  const [subCategory,setSubCategory] = useState('Sarees')
  const [bestseller,setBestseller] = useState(false)
  const [sizes,setSizes] = useState([])
  const [image1,setImage1] = useState(false)
  const [image2,setImage2] = useState(false)
  const [image3,setImage3] = useState(false)
  const [image4,setImage4] = useState(false)

  const fetchList = async () => {
    try {

      const response = await axios.get(backendUrl + '/api/product/list')
      if (response.data.success) {
        setList(response.data.products.reverse());
      }
      else {
        toast.error(response.data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const removeProduct = async (id) => {
    try {

      const response = await axios.post(backendUrl + '/api/product/remove', { id }, { headers: { token } })

      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList();
      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const openEdit = (item) => {
    setEditId(item._id)
    setName(item.name)
    setDescription(item.description)
    setPrice(String(item.price))
    setCategory(item.category)
    setSubCategory(item.subCategory)
    setBestseller(Boolean(item.bestseller))
    setSizes(item.sizes || [])
    setImage1(false); setImage2(false); setImage3(false); setImage4(false)
    setShowEdit(true)
  }

  const submitEdit = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('productId',editId)
      formData.append('name',name)
      formData.append('description',description)
      formData.append('price',price)
      formData.append('category',category)
      formData.append('subCategory',subCategory)
      formData.append('bestseller',bestseller)
      formData.append('sizes',JSON.stringify(sizes))
      image1 && formData.append('image1',image1)
      image2 && formData.append('image2',image2)
      image3 && formData.append('image3',image3)
      image4 && formData.append('image4',image4)

      const response = await axios.post(backendUrl + '/api/product/update', formData, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        setShowEdit(false)
        await fetchList()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <>
      <p className='mb-2'>All Products List</p>
      <div className='flex flex-col gap-2'>

        {/* ------- List Table Title ---------- */}

        <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className='text-center'>Action</b>
        </div>

        {/* ------ Product List ------ */}

        {
          list.map((item, index) => (
            <div className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm' key={index}>
              <img className='w-12' src={item.image[0]} alt="" />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>{currency}{item.price}</p>
              <button onClick={()=>openEdit(item)} className='text-xs md:text-sm px-2 py-1 border rounded'>Edit</button>
              <p onClick={()=>removeProduct(item._id)} className='text-right md:text-center cursor-pointer text-lg'>X</p>
            </div>
          ))
        }

        { showEdit && (
          <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
            <form onSubmit={submitEdit} className='bg-white p-5 rounded w-[90%] max-w-[700px] overflow-auto max-h-[85vh]'>
              <p className='text-lg mb-3'>Edit Product</p>
              <div className='grid grid-cols-2 gap-3'>
                <input value={name} onChange={(e)=>setName(e.target.value)} className='px-3 py-2 border' placeholder='Name' required/>
                <input value={price} onChange={(e)=>setPrice(e.target.value)} className='px-3 py-2 border' placeholder='Price' type='number' required/>
                <select value={category} onChange={(e)=>setCategory(e.target.value)} className='px-3 py-2 border'>
                  <option value="Banarashi">Banarashi</option>
                  <option value="Tussar Silk Saree">Tussar Silk Saree</option>
                  <option value="Sambalpuri">Sambalpuri</option>
                  <option value="Kanchipuram Saree">Kanchipuram Saree</option>
                  <option value="Chanderi Saree">Chanderi Saree</option>
                  <option value="Bandhani Saree">Bandhani Saree</option>
                  <option value="Dola Silk Saree">Dola Silk Saree</option>
                </select>
                <select value={subCategory} onChange={(e)=>setSubCategory(e.target.value)} className='px-3 py-2 border'>
                  <option value="Sarees">Sarees</option>
                  <option value="Summerwear">Summerwear</option>
                  <option value="Winterwear">Winterwear</option>
                </select>
              </div>
              <textarea value={description} onChange={(e)=>setDescription(e.target.value)} className='w-full mt-3 px-3 py-2 border' placeholder='Description' required/>
              <div className='flex items-center gap-2 mt-3'>
                <input id='bse' type='checkbox' checked={bestseller} onChange={()=>setBestseller(prev=>!prev)} />
                <label htmlFor='bse'>Bestseller</label>
              </div>
              <div className='mt-3'>
                <p className='mb-1 text-sm'>Sizes</p>
                <div className='flex gap-2'>
                  <button type='button' onClick={()=>setSizes(prev=> prev.includes('One Size') ? prev.filter(i=>i!=='One Size') : [...prev,'One Size'])} className={`px-3 py-1 border ${sizes.includes('One Size') ? 'bg-pink-100' : 'bg-slate-200'}`}>One Size</button>
                </div>
              </div>
              <div className='mt-3 grid grid-cols-4 gap-3'>
                <label className='block'>
                  <input type='file' onChange={(e)=>setImage1(e.target.files[0])} />
                </label>
                <label className='block'>
                  <input type='file' onChange={(e)=>setImage2(e.target.files[0])} />
                </label>
                <label className='block'>
                  <input type='file' onChange={(e)=>setImage3(e.target.files[0])} />
                </label>
                <label className='block'>
                  <input type='file' onChange={(e)=>setImage4(e.target.files[0])} />
                </label>
              </div>
              <div className='flex justify-end gap-3 mt-4'>
                <button type='button' onClick={()=>setShowEdit(false)} className='px-4 py-2 border rounded'>Cancel</button>
                <button type='submit' className='px-4 py-2 bg-black text-white rounded'>Save</button>
              </div>
            </form>
          </div>
        )}

      </div>
    </>
  )
}

export default List