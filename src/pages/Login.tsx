import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    const username = Cookies.get('username');
    const jwt = Cookies.get('jwt');

    if (username && jwt) {
      window.location.href = '/'; // Redirect to login
    }
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
  
    try {
      const response = await axios.post(
        'http://localhost:5000/login',
        { email, password },
        {
          headers: { 'Content-Type': 'application/json' },
          // withCredentials: true, // Uncomment if your backend sets cookies
        }
      );
  
      const { token, username } = response.data;
  
      // Store token and username in cookies
      Cookies.set('jwt', token, { expires: 7 }); // expires in 7 days
      Cookies.set('username', username, { expires: 7 });
  
      console.log('Login successful:', response.data);
      window.location.href = '/dashboard';
  
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || 'Login failed');
      }
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2E0062] to-[#3243e2]">
      <div className="bg-zinc-900 text-white rounded-xl shadow-xl p-8 w-full max-w-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-purple-500 flex items-center gap-2">
            <div className="bg-purple-600 w-4 h-4 rounded-sm" />
            ChatSphere
          </h2>
          <div className="text-yellow-400 text-xl">🌞</div>
        </div>

        <p className="text-sm text-zinc-400">Welcome back! Please sign in to continue</p>

        {error && <div className="text-red-400 text-sm">{error}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 text-sm font-semibold">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800 px-4 py-2 rounded-md outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 px-4 py-2 rounded-md outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 transition-colors text-white font-semibold rounded-md"
          >
            Sign In
          </button>
        </form>

        <p className="text-sm text-center text-zinc-400">
          Don’t have an account? <a href="/signup" className="text-purple-400 hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
}
