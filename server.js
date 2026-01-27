const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

// GANTI DENGAN ID GOOGLE SHEETS ANDA
const SHEET_ID = '1WgRRkbg-AkovA1qlqMTBmXqS51PQxNlk9vrtnqz0bYs';

app.use(express.static('public'));

async function getSheetData(sheetName) {
    try {
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
        const response = await axios.get(url);
        
        // Memperbaiki pembersihan data JSON dari Google Sheets
        const dataText = response.data;
        const jsonStart = dataText.indexOf('{');
        const jsonEnd = dataText.lastIndexOf('}') + 1;
        const jsonData = JSON.parse(dataText.slice(jsonStart, jsonEnd));
        
        const rows = jsonData.table.rows;
        const cols = jsonData.table.cols;
        
        return rows.map(row => {
            let obj = {};
            row.c.forEach((cell, i) => {
                if (cols[i] && cols[i].label) {
                    const key = cols[i].label;
                    obj[key] = cell ? cell.v : "";
                }
            });
            return obj;
        });
    } catch (error) {
        console.error(`Gagal mengambil sheet: ${sheetName}`, error.message);
        return [];
    }
}

app.get('/api/data-dusun', async (req, res) => {
    try {
        const [visi, struktur, berita] = await Promise.all([
            getSheetData('VisiMisi'),
            getSheetData('Struktur'),
            getSheetData('Berita')
        ]);
        res.json({ visi, struktur, berita });
    } catch (error) {
        res.status(500).json({ error: "Gagal memproses data dusun" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`Web Dusun Jetis Berhasil Dijalankan!`);
    console.log(`Buka di browser: http://localhost:${PORT}`);
    console.log(`=========================================`);
});