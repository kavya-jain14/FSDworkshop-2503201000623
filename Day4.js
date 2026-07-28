//create one promise that will display user name and password
//using resolve and if data will be rejected its display error message

const userData = {
    username: "Kavya Jain",
    password: "Kavyajain1407"
};

function getUserData() {
    return new Promise((resolve, reject) => {
        if (userData.username && userData.password) {
            resolve(`Username: ${userData.username}, Password: ${userData.password}`);
        } else {
            reject("Error: User data is missing.");
        }
    });
}

getUserData()
    .then(data => console.log(data))
    .catch(error => console.error(error));  