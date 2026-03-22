import React, { useEffect, useState } from 'react'
import axios from 'axios'
const App =  ()  => {
  const [Data, setData] = useState([]);
  const [Page, setPage] = useState(1)
  

  const getData = async () => {
    let response = await axios.get(`https://picsum.photos/v2/list?page=${Page}&limit=12`)
    setData(response.data)
  }

  useEffect(function () {
    getData()
  }, [Page])


  let msg = <h3 className='text-gray-300 text-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold'>Data Loading</h3>

  if(Data.length > 0){
    msg = Data.map((item,idx) => {
      return (
        <div key={item.id}>
          <a href={item.url} target='_blank'>
            <div key={item.id} className=' rounded-xl m-3 h-40 w-44 border-2 border-amber-400 object-cover'>
            <img src={item.download_url} className='w-full h-full rounded-lg' />
          </div>
          <h2 className='text-center font-bold text-lg'>{item.author}</h2>
          </a>
        </div>
      )
    }
  )}

  return (
    <div className='h-screen bg-gray-800 text-white overflow-auto '>
      {/* <button onClick={getData} className='bg-blue-500 text-white font-bold py-2 px-4 m-3 rounded'>Get Data</button> */}
      <div className='flex flex-wrap gap-4'>
        {msg}
      </div>

    <div className='flex justify-center mt-5 items-center p-3 fixed bottom-0 left-0 w-full bg-gray-900'>
      <button onClick={() => 
      { 
        if(Page > 1) 
        {
          setPage(Page- 1) 
          setData([])
        }
      }
    } 
      className='bg-blue-500 active:scale-95 text-white font-bold py-2 px-4 m-3 rounded'>Previous</button>

      <h3 className='text-white font-bold'>Page {Page}</h3>

      <button onClick={() => {
        {
          setData([])
          setPage(Page+1)
        }
      }
      } className='bg-blue-500 active:scale-95 text-white font-bold  py-2 px-4 m-3 rounded'>Next</button>
    </div>

    </div>
  )
}

export default App
