const axios = require('axios');

exports.queryLLM = async (prompt) => {
	const response = await axios.post(
		'http://127.0.0.1:11434/api/generate',
		{
			model: 'llama3', // sen "llama3" veya kurduğun modelin adını yaz
			prompt: prompt,
			stream: false // stream: false => düz string response alırsın
		},
		{
			headers: { 'Content-Type': 'application/json' }
		}
	);
    return response.data.response;
}