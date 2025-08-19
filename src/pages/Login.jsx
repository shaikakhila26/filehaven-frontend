
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Mail, Lock, Eye, EyeOff, AlertCircle, Wifi, WifiOff } from "lucide-react"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [retryCount, setRetryCount] = useState(0)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const navigate = useNavigate()

  useState(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError("")
  }

  const validateForm = () => {
    if (!formData.email) {
      setError("Email is required")
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }
    if (!formData.password) {
      setError("Password is required")
      return false
    }
    return true
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    if (!isOnline) {
      setError("You're offline. Please check your internet connection.")
      return
    }

    setLoading(true)
    setError("")

    try {
      console.log("[v0] Attempting login to:", `${API_BASE}/auth/login`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const data = await res.json()

      if (res.ok) {
        localStorage.setItem("token", data.token)
        navigate("/dashboard")
        setRetryCount(0)
      } else {
        if (res.status === 401) {
          setError("Invalid email or password")
        } else if (res.status === 429) {
          setError("Too many login attempts. Please try again later.")
        } else {
          setError(data.error || "Login failed. Please try again.")
        }
      }
    } catch (err) {
      console.log("[v0] Login error:", err)
      setRetryCount((prev) => prev + 1)

      if (err.name === "AbortError") {
        setError("Request timed out. Please check your connection and try again.")
      } else if (!navigator.onLine) {
        setError("You're offline. Please check your internet connection.")
      } else if (err.message.includes("fetch")) {
        setError("Unable to connect to server. Please check if the server is running.")
      } else {
        setError("Network error. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setError("")
    setRetryCount(0)
    handleLogin({ preventDefault: () => {} })
  }

  const getErrorIcon = () => {
    if (error.includes("offline") || error.includes("internet")) {
      return <WifiOff className="w-4 h-4" />
    }
    if (error.includes("server") || error.includes("connect")) {
      return <Wifi className="w-4 h-4" />
    }
    return <AlertCircle className="w-4 h-4" />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-indigo-400 to-purple-100 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            
              <img src="/logo.jpg" alt="FileHaven Logo" className="h-8 rounded-lg" />
            
            <h1 className="text-2xl font-bold text-gray-900">FileHaven</h1>
          </div>
          <p className="text-gray-600">Welcome back! Please sign in to your account.</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="text-red-500 mt-0.5">{getErrorIcon()}</div>
                  <div className="flex-1">
                    <p className="text-sm text-red-700">{error}</p>
                    {retryCount > 0 && <p className="text-xs text-red-600 mt-1">Attempt {retryCount}</p>}
                    {(error.includes("server") || error.includes("Network")) && (
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                      >
                        Try Again
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isOnline}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                >
                  Create one here
                </button>
              </p>
            </div>
          </form>
        </div>

        
      </div>
    </div>
  )
}

export default Login
