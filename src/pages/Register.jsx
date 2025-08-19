

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, User, Mail, Lock, Cloud, Shield, Zap, RefreshCw, Wifi, WifiOff } from "lucide-react"

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api"

const Register = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors = {}

    if (!name.trim()) newErrors.name = "Full name is required"
    if (!email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid"
    if (!password) newErrors.password = "Password is required"
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getNetworkErrorMessage = (error) => {
    if (!navigator.onLine) {
      return {
        message: "No internet connection. Please check your network and try again.",
        type: "offline",
        icon: <WifiOff className="w-4 h-4" />,
      }
    }

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return {
        message: "Unable to connect to server. Please check if the server is running.",
        type: "connection",
        icon: <Wifi className="w-4 h-4" />,
      }
    }

    if (error.name === "AbortError") {
      return {
        message: "Request timed out. The server might be slow or unavailable.",
        type: "timeout",
        icon: <RefreshCw className="w-4 h-4" />,
      }
    }

    return {
      message: "Network error occurred. Please try again.",
      type: "general",
      icon: <RefreshCw className="w-4 h-4" />,
    }
  }

  const handleRegister = async (e, isRetry = false) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setErrors({})
    if (isRetry) {
      setIsRetrying(true)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const res = await fetch(`${VITE_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const data = await res.json()

      if (res.ok) {
        setRetryCount(0)
        alert("Registration successful. Please log in.")
        navigate("/login")
      } else {
        const errorMessage = data.error || `Registration failed (${res.status})`
        setErrors({ submit: errorMessage, type: "server" })
      }
    } catch (err) {
      clearTimeout(timeoutId)
      const errorInfo = getNetworkErrorMessage(err)
      setErrors({
        submit: errorInfo.message,
        type: errorInfo.type,
        icon: errorInfo.icon,
        canRetry: true,
      })

      if (isRetry) {
        setRetryCount((prev) => prev + 1)
      }
    } finally {
      setLoading(false)
      setIsRetrying(false)
    }
  }

  const handleRetry = (e) => {
    e.preventDefault()
    handleRegister(e, true)
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-blue-300">
      {/* Left Panel - Enhanced */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-500 via-blue-400 via-blue-300  to-indigo-600 text-white flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.2) 2px, transparent 0)`,
              backgroundSize: "50px 50px",
            }}
          ></div>
        </div>

        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center mb-8">
            <div className=" rounded-2xl p-1 mr-4">
               <img src="/logo.jpg" alt="FileHaven Logo" className="h-8 rounded-lg  " />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              FileHaven
            </h1>
          </div>

          <p className="text-xl max-w-md text-blue-100 mb-12 leading-relaxed">
            Your secure and reliable cloud storage. Register now and start managing your files with ease.
          </p>

          {/* Feature highlights */}
          <div className="space-y-6 max-w-sm">
            <div className="flex items-center text-left">
              <div className="bg-white/10 rounded-lg p-2 mr-4">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Secure Storage</h3>
                <p className="text-blue-200 text-sm">End-to-end encryption</p>
              </div>
            </div>
            <div className="flex items-center text-left">
              <div className="bg-white/10 rounded-lg p-2 mr-4">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Lightning Fast</h3>
                <p className="text-blue-200 text-sm">Instant file access</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Enhanced Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <form
            onSubmit={handleRegister}
            className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-2xl p-8 border border-white/20"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
              <p className="text-gray-600">Join FileHaven today</p>
            </div>

            {errors.submit && (
              <div
                className={`mb-6 p-4 border rounded-lg text-sm ${
                  errors.type === "offline"
                    ? "bg-orange-50 border-orange-200 text-orange-700"
                    : errors.type === "timeout"
                      ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                      : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                <div className="flex items-start gap-2">
                  {errors.icon}
                  <div className="flex-1">
                    <p>{errors.submit}</p>
                    {errors.canRetry && (
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleRetry}
                          disabled={isRetrying}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md bg-white border border-current hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <RefreshCw className={`w-3 h-3 ${isRetrying ? "animate-spin" : ""}`} />
                          {isRetrying ? "Retrying..." : "Try Again"}
                        </button>
                        {retryCount > 0 && <span className="text-xs opacity-75">Attempt {retryCount + 1}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-5">
              {/* Name Input */}
              <div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.name
                        ? "border-red-300 focus:ring-red-500 bg-red-50"
                        : "border-gray-200 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    }`}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (errors.name) setErrors((prev) => ({ ...prev, name: null }))
                    }}
                    required
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Email Input */}
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.email
                        ? "border-red-300 focus:ring-red-500 bg-red-50"
                        : "border-gray-200 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    }`}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) setErrors((prev) => ({ ...prev, email: null }))
                    }}
                    required
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Password Input */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.password
                        ? "border-red-300 focus:ring-red-500 bg-red-50"
                        : "border-gray-200 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    }`}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) setErrors((prev) => ({ ...prev, password: null }))
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              disabled={loading || isRetrying}
            >
              {loading || isRetrying ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isRetrying ? "Retrying..." : "Creating Account..."}
                </div>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-blue-600 font-semibold hover:text-blue-700 transition-colors hover:underline focus:outline-none"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>

          {/* Mobile logo for small screens */}
          <div className="lg:hidden text-center mt-8">
            <div className="flex items-center justify-center">
              <Cloud className="w-6 h-6 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-gray-800">FileHaven</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
