import Sidebar from '@/components/sidebar';
import Link from "next/link";

export default function Home() { 
   
  return (
    <div className="flex flex-1  bg-white"> {/* Add flex-1 to make it expand */}
      <Sidebar/>
      <div className="ml-64 p-4 bg-white rounded-lg flex-1 mt-40 h-100" > {/* Add flex-1 to make it expand */}
        <div className="ml-60">
         <h1 className="text-3xl font-bold mb-4">Welcome to Threads</h1> 
        <h2 className="text-lg mb-4">A place to explore and share ideas!!!</h2>

        <div className="mb-4">
          <h3 className="text-lg mb-2">If you are a new user, hit sign up</h3> 
          <h3 className="text-lg mb-2">If you already have an account, log in</h3>
          <div className="flex">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-4 mt-5">
              <Link href="/signup">Sign Up</Link>
            </button>
            <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mt-5">
              <Link href="/login">Log In</Link>
            </button>
          </div>
        </div>
        </div>
         
      </div>
    </div>
  );
}
