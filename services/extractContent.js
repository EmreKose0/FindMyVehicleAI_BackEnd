const fs = require('fs');
const pdfParse = require('pdf-parse');
const fetch = require('node-fetch');
const {JSDOM} = require('jsdom');
const { Readability} = require('@mozilla/readability');

async function extractFromPDF(path) {
    const dataBuffer = fs.readFileSync(path);
    const data = await pdfParse(dataBuffer);
    return data.text;
}

async function extractFromWeb(url){
    const res = await fetch(url);
	const html = await res.text();
	const dom = new JSDOM(html);
	const reader = new Readability(dom.window.document);
	const article = reader.parse();
	return article?.textContent || "";
}

module.exports = {
    extractFromPDF,
    extractFromWeb
}