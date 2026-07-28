// const hello = () => {
//     setTimeout(() => {
//         console.log("Hello World");
//     }, 2000);
// }
// hello();
// console.log("This is asynchronous programming");
//callback,promises,async/await
function add(n1,n2,cb){
    console.log(n1+n2);
    cb();
};
let a = 10;
let b = 20;
add(a,b,function(){
    console.log("This is a callback function");
});
// add(a,b,hello);
// add(hello,sayHi);
// function sayHi(){
//     console.log("This is a callback function");
// }
// function hello(){
//     console.log("Hello World");
// }
