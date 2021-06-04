// create variable to hold db connection
let db;
// establish a connection to IndexedDB database called 'budget-tracker'and set it to version 1
const request = indexedDB.open('budget-tracker', 1);

// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function(event) {
    // save a reference to the database
    const db = event.target.result;
    // create an object store (table) called `new_budget`, set it to have an auto incrementing primary key of sorts
    db.createObjectStore('new_budget', {autoIncrement: true});
};

// upon a successful
request.onsuccess = function(event) {
    // when db is successfully created with its object store (from onupgradeneeded event above) or simply established a connection, save reference to db in global variable
    db = event.target.result;

    // check it app is online, if yes run uploadBudget() function to send all local db data to api
    if(navigator.onLine) {
        //uploadBudget();
    }
};

request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
};