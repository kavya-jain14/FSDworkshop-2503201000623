const fs = require("fs");
//CREATE - Create a new file
fs.writeFile("student.txt", "Name: Kavya Jain\nRoll No: 101", (err) => {
  if (err) throw err;
  console.log("File created successfully!");
});

//READ - Read the contents of a file
fs.readFile("student.txt", "utf8", (err, data) => {
  if (err) throw err;
  console.log("File contents:", data);
});

//UPDATE - Update the contents of a file
fs.appendFile("student.txt", "\nGrade: A", (err) => {
  if (err) throw err;
  console.log("File updated successfully!");
});

// //DELETE - Delete a file
fs.unlink("student.txt", (err) => {
  if (err) throw err;
  console.log("File deleted successfully!");
});