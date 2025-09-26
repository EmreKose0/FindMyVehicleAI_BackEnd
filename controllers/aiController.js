const ollamaService = require('../services/ollamaService');

exports.getVehicleSuggestions = async (req, res) => {
	try {
		const preferences = req.body;

		const prompt = buildPrompt(preferences);

		const llmResponse = await ollamaService.queryLLM(prompt);

		const jsonStart = llmResponse.indexOf('[');
		const jsonEnd = llmResponse.lastIndexOf(']');
		if (jsonStart === -1 || jsonEnd === -1) throw new Error("Invalid JSON in LLM response");
		
		const vehicleDataRaw = llmResponse.slice(jsonStart, jsonEnd + 1);

		const vehicles = JSON.parse(vehicleDataRaw);

		res.json({ success: true, vehicles });
	}
	catch (err) {
		console.error('AI error:', err);
		res.status(500).json({ success: false, message: 'AI suggestion failed.' });
	}
}

function buildPrompt(prefs) {
	return `
	Given the following preferences:

- Type: ${prefs.vehicleType}
- Budget: ${prefs.budget}
- Condition: ${prefs.condition}
- Comfort Level: ${prefs.comfortLevel}
- Sound Quality: ${prefs.soundQuality}
- Subtype: ${prefs.vehicleSubtype}
- Mileage: ${prefs.mileage}
- Year: ${prefs.year}

Suggest 3 ${prefs.vehicleType} models that best match these preferences. 
Use your domain knowledge of real vehicles available in the Turkish market.

Respond ONLY with a valid JSON array in this format:

[
  {
    "id": 1,
    "brand": "Yamaha",	
    "model": "MT-07",
    "year": 2023,
    "price": "₺185,000",
    "engine": "689cc",
    "power": "75 HP",
    "fuelConsumption": "4.2L/100km",
    "image": "/images/motor_naked.svg"
  },
  ...
]
Do not include any explanation or extra text. Just the JSON array.
	`.trim();
}