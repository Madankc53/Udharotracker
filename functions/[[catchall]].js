const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxVZy-biQDZAETUWVW5DoQGYbbkBGeYI2dqbYPJKv9zyy0yuXtCnieluUya0aBpc8iPVg/exec";

// 1. FETCH DATA FROM SHEETS
async function fetchData() {
  try {
    const response = await fetch(WEB_APP_URL);
    const result = await response.json();
    
    if (result.status === "success") {
      console.log("Data retrieved:", result.data);
      // Process your data here (e.g., render it to a table on your website)
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// 2. SEND DATA TO SHEETS
async function sendData(name, email, message) {
  const payload = { name, email, message };

  try {
    const response = await fetch(WEB_APP_URL, {
      method: "POST",
      mode: "cors", // Required
      headers: {
        // Crucial: Use text/plain to trick the browser into skipping the OPTIONS preflight check
        "Content-Type": "text/plain;charset=utf-8", 
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (result.status === "success") {
      alert("Data successfully saved to Google Sheets!");
    } else {
      console.error("Server error:", result.error);
    }
  } catch (error) {
    console.error("Error sending data:", error);
  }
}
