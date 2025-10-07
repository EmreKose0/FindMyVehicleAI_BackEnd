const express = require('express');
const cors = require('cors');
const aiRoutes = require('./routes/aiRoutes');

const app = express();


app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
	const timestamp = new Date().toISOString();
	console.log(`\n🔄 [${timestamp}] ${req.method} ${req.originalUrl}`);
	
	// Log headers if needed
	if (Object.keys(req.headers).length > 0) {
		console.log('📋 Headers:', {
			'content-type': req.headers['content-type'],
			'user-agent': req.headers['user-agent']?.substring(0, 50) + '...',
			'origin': req.headers.origin
		});
	}
	
	// Log request body for POST/PUT requests
	if (req.method === 'POST' || req.method === 'PUT') {
		console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
	}
	
	// Log query parameters if any
	if (Object.keys(req.query).length > 0) {
		console.log('🔍 Query Params:', req.query);
	}
	
	next();
});


app.use('/api/ai', aiRoutes);

// Root endpoint - API bilgileri
app.get('/', (req, res) => {
	res.json({
		message: 'FindMyVehicleAI Backend API',
		version: '1.0.0',
		status: 'running',
		endpoints: {
			'POST /api/ai/recommend': 'Get vehicle recommendations using AI',
			'POST /api/ai/query': 'Query external vehicle API'
		},
		examples: {
			recommend: {
				url: 'POST /api/ai/recommend',
				body: {
					vehicleType: 'araba',
					budget: '500000',
					condition: 'yeni',
					comfortLevel: 'yüksek',
					soundQuality: 'iyi',
					vehicleSubtype: 'sedan',
					mileage: '0',
					year: '2024'
				}
			},
			query: {
				url: 'POST /api/ai/query',
				body: {
					vehicleType: 'araba',
					budget: '500000',
					vehicleSubtype: 'sedan'
				}
			}
		}
	});
});

module.exports = app;