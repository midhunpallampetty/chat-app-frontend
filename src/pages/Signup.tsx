import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
const generateUsername = (): string => {
  const adjectives = ['cool', 'fast', 'smart', 'funny', 'brave']
  const nouns = ['eagle', 'panther', 'panda', 'lion', 'tiger']
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
  const randomNum = Math.floor(Math.random() * 1000)
  return `${randomAdjective}${randomNoun}${randomNum}`
}

const Signup = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('');
  const [isDark, setIsDark] = useState(true)
  const [windowWidth, setWindowWidth] = useState(0)

  useEffect(() => {
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  
    try {
      console.log(username,email,password,"tugdugf")
      const response = await axios.post('http://localhost:5000/register', {
        username,
        email,
        password,
      });
    
      console.log('Success:', response.data);
      alert('Account created successfully!');
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (error: any) {
      console.error('Error:', error);
      alert(`Error: ${error?.response?.data?.message || 'Something went wrong. Please try again.'}`);
    }
    
  }
  

  const handleGenerateUsername = () => {
    setUsername(generateUsername())
  }

  // Theme configuration
  const themeStyles = {
    background: isDark ? 'linear-gradient(135deg, #3a1c71, #4361ee)' : 'linear-gradient(135deg, #9d50bb, #6e48aa)',
    formBackground: isDark ? '#1a1a1a' : '#fff',
    inputBackground: isDark ? '#2d2d2d' : '#f8fafc',
    borderColor: isDark ? '#3d3d3d' : '#e2e8f0',
    textColor: isDark ? '#fff' : '#1e293b',
    buttonBg: '#6d28d9',
    shadow: isDark ? '0 8px 30px rgba(0,0,0,0.3)' : '0 8px 30px rgba(0,0,0,0.12)'
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: themeStyles.background,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1rem'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ 
          width: '100%',
          maxWidth: '400px',
          background: themeStyles.formBackground,
          borderRadius: '12px',
          padding: 'clamp(1rem, 5vw, 2rem)',
          boxShadow: themeStyles.shadow,
          position: 'relative'
        }}
      >
        {/* Theme Toggle */}
        <motion.button
          onClick={() => setIsDark(!isDark)}
          style={{
            position: 'absolute',
            top: windowWidth < 768 ? '1rem' : '1.5rem',
            right: windowWidth < 768 ? '1rem' : '1.5rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
            color: themeStyles.textColor,
          }}
          whileHover={{ scale: 1.1 }}
        >
          {isDark ? '🌞' : '🌙'}
        </motion.button>

        <motion.div style={{ textAlign: 'left' }}>
          <motion.div
            style={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem'
            }}
          >
            <svg width="clamp(24px, 5vw, 30px)" height="clamp(24px, 5vw, 30px)" viewBox="0 0 24 24" fill="#6d28d9" style={{ marginRight: '8px' }}>
              <rect x="2" y="7" width="20" height="15" rx="2" />
              <circle cx="12" cy="16" r="3" />
            </svg>
            <h1 style={{ 
              fontSize: 'clamp(1 rem, 4vw, 1.8rem)',
              fontWeight: '700',
              color: '#6d28d9',
              marginBottom: '0.5rem'
            }}>
              ChatSphere
            </h1>
          </motion.div>
          <p style={{
            fontSize: 'clamp(0.875rem, 2vw, 1rem)',
            color: themeStyles.textColor,
            marginBottom: '1.5rem'
          }}>
            Join our community and start chatting
          </p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block',
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
              fontWeight: '600',
              color: themeStyles.textColor,
              marginBottom: '0.5rem'
            }}>
              Username
            </label>
            <div style={{ 
              display: 'flex', 
              gap: '0.75rem',
              flexDirection: windowWidth <= 480 ? 'column' : 'row'
            }}>
              <motion.input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: themeStyles.inputBackground,
                  border: `2px solid ${themeStyles.borderColor}`,
                  borderRadius: '8px',
                  fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                  color: themeStyles.textColor,
                  fontWeight: '500'
                }}
                whileFocus={{
                  borderColor: '#6d28d9',
                  boxShadow: '0 0 0 3px rgba(109, 40, 217, 0.2)'
                }}
              />
              <motion.button
                type="button"
                onClick={handleGenerateUsername}
                style={{
                  padding: '0.6rem 1rem',
                  background: '#ede9fe',
                  color: '#6d28d9',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                  width: windowWidth <= 480 ? '100%' : 'auto'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Generate
              </motion.button>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block',
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
              fontWeight: '600',
              color: themeStyles.textColor,
              marginBottom: '0.5rem'
            }}>
              Email
            </label>
            <motion.input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                background: themeStyles.inputBackground,
                border: `2px solid ${themeStyles.borderColor}`,
                borderRadius: '8px',
                fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                color: themeStyles.textColor
              }}
              whileFocus={{
                borderColor: '#6d28d9',
                boxShadow: '0 0 0 3px rgba(109, 40, 217, 0.2)'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block',
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
              fontWeight: '600',
              color: themeStyles.textColor,
              marginBottom: '0.5rem'
            }}>
              Password
            </label>
            <motion.input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create password"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                background: themeStyles.inputBackground,
                border: `2px solid ${themeStyles.borderColor}`,
                borderRadius: '8px',
                fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                color: themeStyles.textColor
              }}
              whileFocus={{
                borderColor: '#6d28d9',
                boxShadow: '0 0 0 3px rgba(109, 40, 217, 0.2)'
              }}
            />
          </div>

          <motion.button
            type="submit"
            style={{
              width: '100%',
              padding: 'clamp(0.75rem, 2vw, 0.875rem)',
              background: themeStyles.buttonBg,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: 'clamp(0.9rem, 2vw, 1rem)',
              fontWeight: '600',
              marginBottom: '1rem',
              cursor: 'pointer'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Create Account
          </motion.button>

          <p style={{ 
            textAlign: 'center', 
            color: themeStyles.textColor,
            fontSize: 'clamp(0.8rem, 2vw, 0.85rem)'
          }}>
            Already have an account?{' '}
            <a href="/login" style={{ 
              color: '#6d28d9', 
              fontWeight: '600',
              textDecoration: 'none'
            }}>
              Sign in
            </a>
          </p>
        </form>
      </motion.div>
    </div>
  )
}

export default Signup