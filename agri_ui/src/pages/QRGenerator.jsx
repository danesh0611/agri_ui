import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import QRCode from 'react-qr-code'
import { useAuth } from '../contexts/AuthContext'
import QRScanner from '../components/QRScanner'

export default function QRGenerator() {
	const { t } = useTranslation()
	const { isLoggedIn, user } = useAuth()
	const [batchId, setBatchId] = useState('')
	const [value, setValue] = useState('')

	function handleGenerate(e) {
		e.preventDefault()
		// Generate QR code for the batch ID
		setValue(batchId)
	}

	return (
		<section className="min-h-[70vh] px-4 py-10">
			{/* QR Generator Section */}
			<div className="max-w-lg mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-10">
				<h2 className="text-xl font-semibold text-slate-900">{t('qrGenerator.title')}</h2>
				<p className="mt-1 text-sm text-slate-600">{t('qrGenerator.subtitle')}</p>
				{!isLoggedIn && (
					<div className="mt-3 text-sm text-slate-700">
						Please <Link to="/login" className="text-secondary underline">{t('login.loginButton')}</Link> to generate a QR code. New here? <Link to="/signup" className="text-secondary underline">{t('signup.signupButton')}</Link>.
					</div>
				)}

				{isLoggedIn && user && (
					<div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
						<p className="text-sm text-green-800">
							{t('dashboard.welcome')}, <strong>{user.username}</strong>! ({user.email})
						</p>
					</div>
				)}

				{isLoggedIn && (
					<form className="mt-6 space-y-4" onSubmit={handleGenerate}>
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">Batch ID</label>
							<input 
								type="text" 
								value={batchId} 
								onChange={e => setBatchId(e.target.value)} 
								required 
								className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-secondary" 
								placeholder="Enter Batch ID (e.g., 0x123...)" 
							/>
						</div>
						<button type="submit" className="inline-flex items-center justify-center rounded-md bg-primary text-white px-4 py-2.5 font-medium hover:bg-primary-dark transition">
							Generate QR Code for Batch ID
						</button>
					</form>
				)}

				{value && (
					<div className="mt-8 flex flex-col items-center gap-4">
						<div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
							<QRCode value={value} size={192} />
						</div>
						<p className="text-sm text-slate-600 break-all">Batch ID: {value}</p>
					</div>
				)}
			</div>

			{/* QR Scanner Section - Always visible */}
			<div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6">
				<h3 className="text-xl font-semibold text-slate-900 mb-6">🔍 Scan QR Code to View Batch Details</h3>
				<QRScanner />
			</div>
		</section>
	)
}