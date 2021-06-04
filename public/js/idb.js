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
        uploadBudget();
    }
};

request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
};

// this function will be executed if we attempt to submit a new budget and there's no internet connection
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions
    const transaction = db.transaction(['new_budget'], 'readwrite');

    // access the object store for `new_budget`
    const budgetObjectStore = transaction.objectStore('new_budget');

    // add record to your store with add model
    budgetObjectStore.add(record);
}

// function to get data from IndexedDB and upload it to our server when the internet connection is back
function uploadBudget() {
    // open a transaction on your db
    const transaction = db.transaction(['new_budget'], 'readwrite');

    // access your object store
    const budgetObjectStore = transaction.objectStore('new_budget');

    // get all records from store and set to a variable
    const getAll = budgetObjectStore.getAll();

    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function() {
        // if there was data in indexedDB's store, let's send it to the api server
        if(getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if(serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    // open one more transaction
                    const transaction = db.transaction(['new_budget'], 'readwrite');
                    // access the new_budget object store
                    const budgetObjectStore = transaction.objectStore('new_budget');
                    // clear all items in your store
                    budgetObjectStore.clear();

                    alert('All saved budget has been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }; 
}

// listen for app coming back online
window.addEventListener('online', uploadBudget);
