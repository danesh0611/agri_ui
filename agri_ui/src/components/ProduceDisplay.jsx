import { useState, useEffect } from 'react'
import { useContract } from '../hooks/useContract'
import { FaSearch, FaSpinner, FaExclamationTriangle, FaLeaf, FaTruck, FaStore } from 'react-icons/fa'

export default function ProduceDisplay({ recentTransactions = [] }) {
	const { getProduce, isConnected, connectWallet, isLoading, error } = useContract()
	const [batchId, setBatchId] = useState('')
	const [produceData, setProduceData] = useState(null)
	const [isLoadingProduce, setIsLoadingProduce] = useState(false)
	const [searchError, setSearchError] = useState('')

	const handleSearch = async (e) => {
		e.preventDefault()
		
		if (!batchId.trim()) {
			setSearchError('Please enter a batch ID')
			return
		}

		if (!isConnected) {
			setSearchError('Please connect your wallet first to search batch details')
			return
		}

		setIsLoadingProduce(true)
		setSearchError('')
		setProduceData(null)

		try {
			const data = await getProduce(batchId)
			setProduceData(data)
		} catch (err) {
			console.error('Error fetching produce:', err)
			setSearchError('Failed to fetch produce details. Please check the batch ID.')
		} finally {
			setIsLoadingProduce(false)
		}
	}

	const formatDate = (timestamp) => {
		if (!timestamp || timestamp === '0') return 'N/A'
		return new Date(parseInt(timestamp) * 1000).toLocaleDateString()
	}

	const formatAddress = (address) => {
		if (!address) return 'N/A'
		return `${address.slice(0, 6)}...${address.slice(-4)}`
	}

	// Auto-fetch latest batch ID from recent transactions
	useEffect(() => {
		if (recentTransactions.length > 0 && isConnected) {
			const latestTransaction = recentTransactions[0]
			if (latestTransaction && latestTransaction.hash) {
				setBatchId(latestTransaction.hash)
				// Auto-search for the latest batch
				const autoSearch = async () => {
					try {
						setIsLoadingProduce(true)
						setSearchError('')
						const data = await getProduce(latestTransaction.hash)
						setProduceData(data)
					} catch (err) {
						console.error('Error auto-fetching produce:', err)
						setSearchError('Failed to fetch latest produce details')
					} finally {
						setIsLoadingProduce(false)
					}
				}
				autoSearch()
			}
		}
	}, [recentTransactions, isConnected])

	const getStageText = (stage) => {
		const stageNum = parseInt(stage)
		switch (stageNum) {
			case 0: return 'Created'
			case 1: return 'Distributed'
			case 2: return 'Retail'
			default: return 'Unknown'
		}
	}

	const getStageColor = (stage) => {
		const stageNum = parseInt(stage)
		switch (stageNum) {
			case 0: return 'bg-blue-100 text-blue-800'
			case 1: return 'bg-yellow-100 text-yellow-800'
			case 2: return 'bg-green-100 text-green-800'
			default: return 'bg-gray-100 text-gray-800'
		}
	}

	if (!isConnected) {
		return (
			<div className="bg-white rounded-lg border border-slate-200 p-6">
				<h3 className="text-xl font-semibold text-slate-900 mb-4">Produce Details</h3>
				<div className="text-center py-8">
					<FaExclamationTriangle className="mx-auto text-yellow-500 text-3xl mb-4" />
					<p className="text-slate-600 mb-4">Connect your MetaMask wallet to view produce details</p>
					<button
						onClick={connectWallet}
						disabled={isLoading}
						className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-white font-medium hover:bg-primary-dark disabled:opacity-60 transition-colors"
					>
						{isLoading ? <FaSpinner className="animate-spin" /> : null}
						Connect Wallet
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="bg-white rounded-lg border border-slate-200 p-6">
			<h3 className="text-xl font-semibold text-slate-900 mb-4">Produce Details</h3>
			
			{/* Search Form */}
			<form onSubmit={handleSearch} className="mb-6">
				<div className="flex gap-2">
					<input
						type="text"
						value={batchId}
						onChange={(e) => setBatchId(e.target.value)}
						placeholder="Enter Batch ID to search"
						className="flex-1 rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
					/>
					<button
						type="submit"
						disabled={isLoadingProduce}
						className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white font-medium hover:bg-primary-dark disabled:opacity-60 transition-colors"
					>
						{isLoadingProduce ? <FaSpinner className="animate-spin" /> : <FaSearch />}
						Search
					</button>
				</div>
			</form>

			{/* Error Messages */}
			{(error || searchError) && (
				<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
					<FaExclamationTriangle className="text-red-500" />
					<span className="text-red-700">{error || searchError}</span>
				</div>
			)}

			{/* Produce Details */}
			{produceData && (
				<div className="space-y-6">
					{/* Stage Badge */}
					<div className="flex justify-center">
						<span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStageColor(produceData.stage)}`}>
							Stage: {getStageText(produceData.stage)}
						</span>
					</div>

					{/* Farmer Information */}
					<div className="bg-green-50 border border-green-200 rounded-lg p-4">
						<div className="flex items-center gap-2 mb-3">
							<FaLeaf className="text-green-600" />
							<h4 className="text-lg font-semibold text-green-800">Farmer Information</h4>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<span className="text-sm font-medium text-green-700">Farmer Name:</span>
								<p className="text-green-900">{produceData.farmerInfo.farmerName}</p>
							</div>
							<div>
								<span className="text-sm font-medium text-green-700">Crop Name:</span>
								<p className="text-green-900">{produceData.farmerInfo.cropName}</p>
							</div>
							<div>
								<span className="text-sm font-medium text-green-700">Total Quantity:</span>
								<p className="text-green-900">{produceData.farmerInfo.quantity} kg</p>
							</div>
							<div>
								<span className="text-sm font-medium text-green-700">Remaining Quantity:</span>
								<p className="text-green-900">{produceData.farmerInfo.remainingQuantity} kg</p>
							</div>
							<div>
								<span className="text-sm font-medium text-green-700">Price per kg:</span>
								<p className="text-green-900">₹{produceData.farmerInfo.pricePerKg}</p>
							</div>
							<div>
								<span className="text-sm font-medium text-green-700">Location:</span>
								<p className="text-green-900">{produceData.farmerInfo.location}</p>
							</div>
							<div>
								<span className="text-sm font-medium text-green-700">Created Date:</span>
								<p className="text-green-900">{formatDate(produceData.farmerInfo.createdDate)}</p>
							</div>
							<div>
								<span className="text-sm font-medium text-green-700">Farmer Address:</span>
								<p className="text-green-900 font-mono text-sm">{formatAddress(produceData.farmerInfo.farmer)}</p>
							</div>
						</div>
					</div>

					{/* Distributors */}
					{produceData.distributors.length > 0 && (
						<div className="space-y-4">
							<h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
								<FaTruck className="text-blue-600" />
								Distributors ({produceData.distributors.length})
							</h4>
							{produceData.distributors.map((distributor, index) => (
								<div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<span className="text-sm font-medium text-blue-700">Distributor Name:</span>
											<p className="text-blue-900">{distributor.distributorName}</p>
										</div>
										<div>
											<span className="text-sm font-medium text-blue-700">Quantity Received:</span>
											<p className="text-blue-900">{distributor.quantityReceived} kg</p>
										</div>
										<div>
											<span className="text-sm font-medium text-blue-700">Remaining Quantity:</span>
											<p className="text-blue-900">{distributor.remainingQuantity} kg</p>
										</div>
										<div>
											<span className="text-sm font-medium text-blue-700">Purchase Price:</span>
											<p className="text-blue-900">₹{distributor.purchasePrice}</p>
										</div>
										<div>
											<span className="text-sm font-medium text-blue-700">Warehouse Location:</span>
											<p className="text-blue-900">{distributor.warehouseLocation}</p>
										</div>
										<div>
											<span className="text-sm font-medium text-blue-700">Handover Date:</span>
											<p className="text-blue-900">{formatDate(distributor.handoverDate)}</p>
										</div>
										<div className="md:col-span-2">
											<span className="text-sm font-medium text-blue-700">Transport Details:</span>
											<p className="text-blue-900">{distributor.transportDetails}</p>
										</div>
										<div>
											<span className="text-sm font-medium text-blue-700">Distributor Address:</span>
											<p className="text-blue-900 font-mono text-sm">{formatAddress(distributor.distributor)}</p>
										</div>
									</div>
								</div>
							))}
						</div>
					)}

					{/* Retailers */}
					{produceData.retailers.length > 0 && (
						<div className="space-y-4">
							<h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
								<FaStore className="text-purple-600" />
								Retailers ({produceData.retailers.length})
							</h4>
							{produceData.retailers.map((retailer, index) => (
								<div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<span className="text-sm font-medium text-purple-700">Retailer Name:</span>
											<p className="text-purple-900">{retailer.retailerName}</p>
										</div>
										<div>
											<span className="text-sm font-medium text-purple-700">Shop Location:</span>
											<p className="text-purple-900">{retailer.shopLocation}</p>
										</div>
										<div>
											<span className="text-sm font-medium text-purple-700">Retail Quantity:</span>
											<p className="text-purple-900">{retailer.retailQuantity} kg</p>
										</div>
										<div>
											<span className="text-sm font-medium text-purple-700">Purchase Price:</span>
											<p className="text-purple-900">₹{retailer.retailPurchasePrice}</p>
										</div>
										<div>
											<span className="text-sm font-medium text-purple-700">Consumer Price:</span>
											<p className="text-purple-900">₹{retailer.consumerPrice} per kg</p>
										</div>
										<div>
											<span className="text-sm font-medium text-purple-700">Expiry Date:</span>
											<p className="text-purple-900">{formatDate(retailer.expiryDate)}</p>
										</div>
										<div>
											<span className="text-sm font-medium text-purple-700">Distributor Source:</span>
											<p className="text-purple-900">{retailer.distributorName}</p>
										</div>
										<div>
											<span className="text-sm font-medium text-purple-700">Retailer Address:</span>
											<p className="text-purple-900 font-mono text-sm">{formatAddress(retailer.retailer)}</p>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	)
}
