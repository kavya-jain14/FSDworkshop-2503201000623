import fs from "fs";
const filename = "student.txt";
async function createFile() {
  try {
    await fs.promises.writeFile(filename, "Name: Kavya Jain\nRoll No: 2503201000623");
    console.log("File created successfully!");
  } catch (err) {
    console.error("Error creating file:", err);
  }
}

async function readFile() {
  try {
    const data = await fs.promises.readFile(filename, "utf8");
    console.log("File contents:", data);
  } catch (err) {
    console.error("Error reading file:", err);
  }
}

async function updateFile() {
  try {
    await fs.promises.appendFile(filename, "\nGrade: A");
    console.log("File updated successfully!");
  } catch (err) {
    console.error("Error updating file:", err);
  }
}

async function deleteFile() {
  try {
    await fs.promises.unlink(filename);
    console.log("File deleted successfully!");
  } catch (err) {
    console.error("Error deleting file:", err);
  }
}

// Example usage
(async () => {
  await createFile();
  await readFile();
  await updateFile();
  await readFile()
})();