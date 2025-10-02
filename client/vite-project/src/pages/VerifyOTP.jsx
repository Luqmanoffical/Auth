import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../api/authApi";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authService.verifyOTP({ email, otp });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the OTP sent to your email
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div>
            <input
              name="otp"
              type="text"
              required
              maxLength="6"
              className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
