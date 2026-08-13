async function fetchData() {
    console.log("This is fetch data");
    const container = document.getElementById("student-list");
    try {
        const response = await fetch("./student.json");
        if (!response.ok) {
            throw new Error(`Failed to load file! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Data Fetched !", data);
        container.innerHTML = "";
        data.forEach(student => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <h3>${student.first_name} ${student.last_name}</h3>
                <p><strong>Major:</strong> ${student.major}</p>
                <p><strong>GPA:</strong> ${student.gpa}</p>
                <p><strong>Email:</strong> ${student.email}</p>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        container.innerHTML = `<p class="error">Error: ${error.message}. <br>Make sure students.json is in the same folder as index.html.</p>`;
    }
}
fetchData().then(() => {
    console.log("Fetch data completed");
});