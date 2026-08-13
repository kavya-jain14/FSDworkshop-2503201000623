//create one promise that will display user name and password
//using resolve and if data will be rejected its display error message

// const userData = {
//     username: "Kavya Jain",
//     password: "Kavyajain1407"
// };

// function getUserData() {
//     return new Promise((resolve, reject) => {
//         if (userData.username && userData.password) {
//             resolve(`Username: ${userData.username}, Password: ${userData.password}`);
//         } else {
//             reject("Error: User data is missing.");
//         }
//     });
// }

// getUserData()
//     .then(data => console.log(data))
//     .catch(error => console.error(error));  
// async and await
// const userData = {
//     username: "Kavya Jain",
//     password: "Kavyajain1407"
// };

// async function getUserData() {
//     try {
//         if (userData.username && userData.password) {
//             return `Username: ${userData.username}, Password: ${userData.password}`;
//         } else {
//             throw new Error("Error: User data is missing.");
//         }
//     } catch (error) {
//         throw error;
//     }
// }

// getUserData()
//     .then(data => console.log(data))
//     .catch(error => console.error(error));
async function getMessage() {
  return "";
}

async function main() {
  const message = await getMessage();
  console.log(message);
}
console.log("This is asynchronous programming");
main();