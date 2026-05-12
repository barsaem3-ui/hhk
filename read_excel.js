const xlsx = require('xlsx');

try {
    const workbook = xlsx.readFile('G:\\내 드라이브\\0. 메모.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log("Sheet Name:", sheetName);
    if (data.length > 0) {
        console.log("Headers:", data[0]);
        console.log("First row data:", data[1]);
    } else {
        console.log("File is empty.");
    }
} catch (err) {
    console.error("Error reading file:", err.message);
}
