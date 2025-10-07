const axios = require('axios');

exports.getVehicleSuggestions = async (req, res) => {
	try {
		const preferences = req.body;

		// Extract only required fields for RAG system
		const { vehicleType, budget, vehicleSubtype } = preferences;
		
		// Fix budget format for RAG system
		let cleanedBudget = budget;
		if (budget) {
			// Clean and normalize budget string - RAG system expects EN DASH (–) not regular dash (-)
			cleanedBudget = budget
				.replace(/-/g, '–')      // Replace regular dash with en dash (RAG expects this!)
				.replace(/—/g, '–')      // Replace em dash with en dash  
				.replace(/\u2014/g, '–') // Replace unicode em dash with en dash
				.replace(/\s+/g, ' ')    // Normalize multiple spaces to single space
				.trim();
			
			console.log('🔧 Budget original (Recommend):', JSON.stringify(budget));
			console.log('🔧 Budget cleaned (Recommend):', JSON.stringify(cleanedBudget));
		}

		// Create exact template for RAG system
		const apiData = {
			vehicleType: vehicleType || "",
			budget: cleanedBudget || "",
			vehicleSubtype: vehicleSubtype || ""
		};

		console.log('🚀 Forwarding to RAG System (Recommend):', apiData);

		// Forward the request to the RAG system
		const response = await axios.post('http://localhost:8000/query', apiData, {
			headers: {
				'accept': 'application/json',
				'Content-Type': 'application/json'
			},
			timeout: 30000 // 30 second timeout
		});

		console.log('✅ RAG System Response Status (Recommend):', response.status);
		console.log('📦 RAG System Response Data (Recommend):', response.data);

		// Format response to match frontend expectations
		const finalResponse = {
			success: true,
			vehicles: response.data.recommendations || [],
			query: response.data.query,
			total_found: response.data.total_found || 0,
			message: response.data.message
		};
		
		console.log('🎯 Sending to Frontend (Recommend):', JSON.stringify(finalResponse, null, 2));
		
		res.json(finalResponse);
	}
	catch (err) {
		console.error('❌ RAG System error (Recommend):', err.message);
		
		// Handle different types of errors (same as queryVehicleAPI)
		if (err.response) {
			console.error('🔴 RAG System Error Response (Recommend):', err.response.status, err.response.data);
			const errorResponse = {
				success: false,
				message: 'RAG System error',
				error: err.response.data,
				status: err.response.status
			};
			console.log('🎯 Sending Error to Frontend (Recommend):', JSON.stringify(errorResponse, null, 2));
			res.status(err.response.status).json(errorResponse);
		} else if (err.request) {
			const errorResponse = {
				success: false,
				message: 'RAG System is not reachable. Make sure it\'s running on http://localhost:8000',
				hint: 'Check if your RAG server is running'
			};
			console.log('🎯 Sending Error to Frontend (Recommend):', JSON.stringify(errorResponse, null, 2));
			res.status(503).json(errorResponse);
		} else if (err.code === 'ECONNREFUSED') {
			const errorResponse = {
				success: false,
				message: 'Cannot connect to RAG System',
				hint: 'Start your RAG server on http://localhost:8000'
			};
			console.log('🎯 Sending Error to Frontend (Recommend):', JSON.stringify(errorResponse, null, 2));
			res.status(503).json(errorResponse);
		} else {
			const errorResponse = {
				success: false,
				message: 'Internal server error',
				error: err.message
			};
			console.log('🎯 Sending Error to Frontend (Recommend):', JSON.stringify(errorResponse, null, 2));
			res.status(500).json(errorResponse);
		}
	}
}

// Middleware to forward user data to external API
exports.queryVehicleAPI = async (req, res) => {
	try {
		// Extract only required fields for RAG system
		const { vehicleType, budget, vehicleSubtype } = req.body;
		
		// Fix budget format for RAG system
		let cleanedBudget = budget;
		if (budget) {
			// Clean and normalize budget string - RAG system expects EN DASH (–) not regular dash (-)
			cleanedBudget = budget
				.replace(/-/g, '–')      // Replace regular dash with en dash (RAG expects this!)
				.replace(/—/g, '–')      // Replace em dash with en dash  
				.replace(/\u2014/g, '–') // Replace unicode em dash with en dash
				.replace(/\s+/g, ' ')    // Normalize multiple spaces to single space
				.trim();
			
			console.log('🔧 Budget original (Query):', JSON.stringify(budget));
			console.log('🔧 Budget cleaned (Query):', JSON.stringify(cleanedBudget));
		}

		// Create exact template for RAG system
		const apiData = {
			vehicleType: vehicleType || "",
			budget: cleanedBudget || "",
			vehicleSubtype: vehicleSubtype || ""
		};

		console.log('🚀 Original request:', req.body);
		console.log('🚀 Forwarding to RAG System (Query):', apiData);

		// Forward the request to the external API
		const response = await axios.post('http://localhost:8000/query', apiData, {
			headers: {
				'accept': 'application/json',
				'Content-Type': 'application/json'
			},
			timeout: 30000 // 30 second timeout
		});

		console.log('✅ RAG System Response Status:', response.status);
		console.log('📦 RAG System Response Data:', response.data);

		// Forward the response back to the frontend
		const finalResponse = response.data;
		console.log('🎯 Sending to Frontend:', JSON.stringify(finalResponse, null, 2));
		
		res.json(finalResponse);
	}
	catch (err) {
		console.error('❌ External API error:', err.message);
		
		// Handle different types of errors
		if (err.response) {
			// The external API responded with an error status
			console.error('🔴 RAG System Error Response:', err.response.status, err.response.data);
			const errorResponse = {
				success: false,
				message: 'RAG System error',
				error: err.response.data,
				status: err.response.status
			};
			console.log('🎯 Sending Error to Frontend:', JSON.stringify(errorResponse, null, 2));
			res.status(err.response.status).json(errorResponse);
		} else if (err.request) {
			// The request was made but no response was received
			console.error('🔴 RAG System not reachable - Is it running on http://localhost:8000?');
			const errorResponse = {
				success: false,
				message: 'RAG System is not reachable. Make sure it\'s running on http://localhost:8000',
				hint: 'Check if your RAG server is running'
			};
			console.log('🎯 Sending Error to Frontend:', JSON.stringify(errorResponse, null, 2));
			res.status(503).json(errorResponse);
		} else if (err.code === 'ECONNREFUSED') {
			console.error('🔴 Connection refused - RAG System not running');
			const errorResponse = {
				success: false,
				message: 'Cannot connect to RAG System',
				hint: 'Start your RAG server on http://localhost:8000'
			};
			console.log('🎯 Sending Error to Frontend:', JSON.stringify(errorResponse, null, 2));
			res.status(503).json(errorResponse);
		} else {
			// Something else happened
			console.error('🔴 Unexpected error:', err);
			const errorResponse = {
				success: false,
				message: 'Internal server error',
				error: err.message
			};
			console.log('🎯 Sending Error to Frontend:', JSON.stringify(errorResponse, null, 2));
			res.status(500).json(errorResponse);
		}
	}
}
