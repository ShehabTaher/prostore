import Loader from '@/assets/loader.gif'
import Image from 'next/image'
const Loading = () => {
  return (
    <div className='flex items-center justify-center h-screen'>
      <Image src={Loader} alt='Loading...' width={100} height={100} />
    </div>
  )
}

export default Loading
