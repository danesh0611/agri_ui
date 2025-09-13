import { useState, useEffect, useCallback } from 'react'
import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers'
import { SUPPLY_CHAIN_ABI, CONTRACT_ADDRESS } from '../lib/contractABI'

export const useContract = () => {
	const [provider, setProvider] = useState(null)
	const [signer, setSigner] = useState(null)
	const [contract, setContract] = useState(null)
	const [account, setAccount] = useState('')
	const [isConnected, setIsConnected] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')

	// Check if MetaMask is installed
	const isMetaMaskInstalled = () => {
		return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask
	}

	// Initialize provider, signer, and contract
	const initializeContract = useCallback(async () => {
		if (!isMetaMaskInstalled()) {
			setError('MetaMask not installed')
			return false
		}

		try {
			setIsLoading(true)
			setError('')

			// Create provider
			const newProvider = new BrowserProvider(window.ethereum)
			setProvider(newProvider)

			// Get signer
			const newSigner = await newProvider.getSigner()
			setSigner(newSigner)

			// Get account address
			const address = await newSigner.getAddress()
			setAccount(address)
			setIsConnected(true)

			// Create contract instance
			const contractInstance = new Contract(CONTRACT_ADDRESS, SUPPLY_CHAIN_ABI, newSigner)
			setContract(contractInstance)

			return true
		} catch (err) {
			console.error('Error initializing contract:', err)
			setError('Failed to connect to contract')
			setIsConnected(false)
			return false
		} finally {
			setIsLoading(false)
		}
	}, [])

	// Connect wallet and initialize contract
	const connectWallet = async () => {
		if (!isMetaMaskInstalled()) {
			setError('MetaMask not installed')
			return false
		}

		try {
			setIsLoading(true)
			setError('')

			// Request account access
			await window.ethereum.request({
				method: 'eth_requestAccounts',
			})

			return await initializeContract()
		} catch (err) {
			console.error('Error connecting wallet:', err)
			if (err.code === 4001) {
				setError('User rejected the connection request')
			} else {
				setError('Failed to connect wallet')
			}
			return false
		} finally {
			setIsLoading(false)
		}
	}

	// Disconnect wallet
	const disconnectWallet = () => {
		setProvider(null)
		setSigner(null)
		setContract(null)
		setAccount('')
		setIsConnected(false)
		setError('')
	}

	// Contract interaction functions
	const createProduce = async (farmerName, cropName, quantity, pricePerKg, location) => {
		if (!contract) {
			throw new Error('Contract not initialized. Please connect MetaMask wallet.')
		}

		if (!isConnected) {
			throw new Error('MetaMask wallet not connected')
		}

		try {
			setIsLoading(true)
			setError('')

			// Convert price to wei (pricePerKg is in ETH, convert to wei)
			const priceInWei = parseEther(pricePerKg.toString())

			console.log('Creating produce with params:', {
				farmerName,
				cropName,
				quantity: quantity.toString(),
				pricePerKg: priceInWei.toString(),
				location
			})

			const tx = await contract.createProduce(
				farmerName,
				cropName,
				quantity,
				priceInWei,
				location
			)

			console.log('Transaction sent:', tx.hash)
			
			// Wait for transaction confirmation
			const receipt = await tx.wait()
			console.log('Transaction confirmed:', receipt)

			// Return the batch ID from the transaction receipt
			// The createProduce function returns bytes32 batchId
			const batchId = receipt.logs[0].topics[1] // Extract batchId from event
			return batchId
		} catch (err) {
			console.error('Error creating produce:', err)
			setError(`Failed to create produce: ${err.message}`)
			throw err
		} finally {
			setIsLoading(false)
		}
	}

	const addDistributor = async (
		batchId,
		cropName,
		distributorName,
		quantityReceived,
		purchasePrice,
		transportDetails,
		warehouseLocation,
		handoverDate
	) => {
		if (!contract) {
			throw new Error('Contract not initialized. Please connect MetaMask wallet.')
		}

		if (!isConnected) {
			throw new Error('MetaMask wallet not connected')
		}

		try {
			setIsLoading(true)
			setError('')

			// Convert price to wei (purchasePrice is in ETH, convert to wei)
			const priceInWei = parseEther(purchasePrice.toString())

			console.log('Adding distributor with params:', {
				batchId,
				cropName,
				distributorName,
				quantityReceived: quantityReceived.toString(),
				purchasePrice: priceInWei.toString(),
				transportDetails,
				warehouseLocation,
				handoverDate: handoverDate.toString()
			})

			const tx = await contract.addDistributor(
				batchId,
				cropName,
				distributorName,
				quantityReceived,
				priceInWei,
				transportDetails,
				warehouseLocation,
				handoverDate
			)

			console.log('Transaction sent:', tx.hash)
			
			// Wait for transaction confirmation
			const receipt = await tx.wait()
			console.log('Transaction confirmed:', receipt)

			return tx.hash
		} catch (err) {
			console.error('Error adding distributor:', err)
			setError(`Failed to add distributor: ${err.message}`)
			throw err
		} finally {
			setIsLoading(false)
		}
	}

	const addRetailer = async (
		batchId,
		cropName,
		distributorName,
		retailerName,
		shopLocation,
		retailQuantity,
		retailPurchasePrice,
		consumerPrice,
		expiryDate
	) => {
		if (!contract) {
			throw new Error('Contract not initialized. Please connect MetaMask wallet.')
		}

		if (!isConnected) {
			throw new Error('MetaMask wallet not connected')
		}

		try {
			setIsLoading(true)
			setError('')

			// Convert prices to wei (prices are in ETH, convert to wei)
			const retailPriceInWei = parseEther(retailPurchasePrice.toString())
			const consumerPriceInWei = parseEther(consumerPrice.toString())

			console.log('Adding retailer with params:', {
				batchId,
				cropName,
				distributorName,
				retailerName,
				shopLocation,
				retailQuantity: retailQuantity.toString(),
				retailPurchasePrice: retailPriceInWei.toString(),
				consumerPrice: consumerPriceInWei.toString(),
				expiryDate: expiryDate.toString()
			})

			const tx = await contract.addRetailer(
				batchId,
				cropName,
				distributorName,
				retailerName,
				shopLocation,
				retailQuantity,
				retailPriceInWei,
				consumerPriceInWei,
				expiryDate
			)

			console.log('Transaction sent:', tx.hash)
			
			// Wait for transaction confirmation
			const receipt = await tx.wait()
			console.log('Transaction confirmed:', receipt)

			return tx.hash
		} catch (err) {
			console.error('Error adding retailer:', err)
			setError(`Failed to add retailer: ${err.message}`)
			throw err
		} finally {
			setIsLoading(false)
		}
	}

	const getProduce = async (batchId) => {
		if (!contract) {
			throw new Error('Contract not initialized')
		}

		try {
			console.log('Fetching produce data for batchId:', batchId)

			const produce = await contract.getProduce(batchId)
			
			console.log('Raw blockchain data:', produce)
			
			// Format the data for easier use
			const formattedData = {
				farmerInfo: {
					farmerName: produce.farmerInfo.farmerName,
					cropName: produce.farmerInfo.cropName,
					quantity: produce.farmerInfo.quantity.toString(),
					remainingQuantity: produce.farmerInfo.remainingQuantity.toString(),
					pricePerKg: formatEther(produce.farmerInfo.pricePerKg),
					location: produce.farmerInfo.location,
					createdDate: produce.farmerInfo.createdDate.toString(),
					farmer: produce.farmerInfo.farmer
				},
				distributors: produce.distributors.map(d => ({
					distributorName: d.distributorName,
					quantityReceived: d.quantityReceived.toString(),
					remainingQuantity: d.remainingQuantity.toString(),
					purchasePrice: formatEther(d.purchasePrice),
					transportDetails: d.transportDetails,
					warehouseLocation: d.warehouseLocation,
					handoverDate: d.handoverDate.toString(),
					timestamp: d.timestamp.toString(),
					distributor: d.distributor
				})),
				retailers: produce.retailers.map(r => ({
					retailerName: r.retailerName,
					shopLocation: r.shopLocation,
					retailQuantity: r.retailQuantity.toString(),
					retailPurchasePrice: formatEther(r.retailPurchasePrice),
					consumerPrice: formatEther(r.consumerPrice),
					expiryDate: r.expiryDate.toString(),
					timestamp: r.timestamp.toString(),
					retailer: r.retailer,
					distributorName: r.distributorName
				})),
				stage: produce.stage
			}

			console.log('Formatted blockchain data:', formattedData)
			return formattedData
		} catch (err) {
			console.error('Error getting produce:', err)
			setError(`Failed to get produce details: ${err.message}`)
			throw err
		}
	}

	const getFarmerBatches = async (farmerAddress) => {
		if (!contract) {
			throw new Error('Contract not initialized')
		}

		try {
			const batches = await contract.getFarmerBatches(farmerAddress)
			return batches
		} catch (err) {
			console.error('Error getting farmer batches:', err)
			setError('Failed to get farmer batches')
			throw err
		}
	}

	// Handle account change
	const handleAccountsChanged = (accounts) => {
		if (accounts.length === 0) {
			disconnectWallet()
		} else if (accounts[0] !== account) {
			initializeContract()
		}
	}

	// Handle chain change
	const handleChainChanged = () => {
		initializeContract()
	}

	// Set up event listeners
	useEffect(() => {
		if (isMetaMaskInstalled()) {
			window.ethereum.on('accountsChanged', handleAccountsChanged)
			window.ethereum.on('chainChanged', handleChainChanged)

			// Check if already connected on mount
			const checkConnection = async () => {
				try {
					const accounts = await window.ethereum.request({
						method: 'eth_accounts',
					})

					if (accounts.length > 0) {
						await initializeContract()
					}
				} catch (err) {
					console.error('Error checking connection:', err)
				}
			}

			checkConnection()

			// Cleanup event listeners
			return () => {
				if (window.ethereum.removeListener) {
					window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
					window.ethereum.removeListener('chainChanged', handleChainChanged)
				}
			}
		}
	}, [initializeContract, account])

	return {
		// State
		provider,
		signer,
		contract,
		account,
		isConnected,
		isLoading,
		error,

		// Actions
		connectWallet,
		disconnectWallet,
		createProduce,
		addDistributor,
		addRetailer,
		getProduce,
		getFarmerBatches,

		// Utils
		isMetaMaskInstalled,
		formatEther,
		parseEther
	}
}
