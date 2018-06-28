//import IndexedDBInstance from "./db/IndexedDB";
const IndexedDBInstance = require('./db/IndexedDB').default; 

module.exports = {
    get : {
        /**
         * Gets items from indexDB
         * @param storeName name of the indexDB store 
         * @param callback callback when fetched 
         */
        offline: (storeName, callback) => {
            IndexedDBInstance().then(instance => {
                instance.getAll("OfflineStorage").then(callback);
            });
        }, 
        /**
         * Get request from URL 
         * @param url the url to fetch from 
         * @returns Promise from fetch 
         */
        online: (url) => {
            return fetch(url, {
                method: 'GET',
            });
        }
    }, 
    add : {
        /**
         * Adds item to indexDB
         * @param storeName name of the indexDB store
         * @param item the item to add 
         */
        offline : (storeName, item) => {
            IndexedDBInstance().then(instance => {
                instance.add(storeName, item);
            }); 
        }, 
        /**
         * Adds item to online storage 
         * @param url the url to add to 
         * @param data to be posted 
         */
        online : (url, data) => {
            return fetch(url, {
                body: JSON.stringify(data),
                method: 'POST',
            })
        }
    }, 
    delete : {
        /**
         * Removes item from indexDB
         * @param storeName name of the indexDB store
         * @param identifier the identifier of item to delete 
         */
        offline : (storeName, identifier) => {
            IndexedDBInstance().then(instance => {
                instance.delete(storeName, identifier)
            }); 
        },
        /**
         * Removes item from online storage
         * @param url the url to call DELETE method on 
         * @param parameter passed as ?data to specify what to delete
         * @returns Promise from fetch 
         */
        online : (url, parameter) => { // parameters er data._id for oss!
            return fetch(url + "?data=" + parameter, {
                method: 'DELETE',
            });
        }
    }, 
    edit : {
        /**
         * Edits item in indexDB store
         * @param storeName name of the indexDB store 
         * @param item item to replace the old one 
         */
        offline : (storeName, item) => {
            IndexedDBInstance().then(instance => {
                instance.put(storeName, item);
            });
        }, 
        online : () => {
            throw "offline edit not implemeted yet (Storage.js)";
        }
    }
}