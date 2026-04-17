fetch('http://localhost:5000/complaint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({text: "water leaking and bursting everywhere"})
}).then(res => res.json().then(data => {
    console.log("Status:", res.status);
    console.log(data);
})).catch(err => {
    console.error("Fetch Error:", err);
});
