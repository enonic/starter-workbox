/**
 * Background sync local. No service worker
 */

import storage from './storage';
import { updateUI } from '../../bs';

const SyncHelper = require('./sync-helper');

const ToasterInstance = require('../toaster').default;
let wentOnline = false;
window.addEventListener('online', () => {
    wentOnline = navigator.onLine;
});

function getItemsFromDB() {
    return Promise.all([
        // fetching items from indexDB
        storage.get.offline(
            SyncHelper.storeNames.deleted,
            nodes => (nodes ? nodes.map(node => node.value) : [])
        ),
        storage.get.offline(
            SyncHelper.storeNames.offline,
            nodes => (nodes ? nodes.map(node => node.value) : [])
        )
    ]);
}

let syncInProgress = false;
let needSync = false;

const sync = function() {
    if (syncInProgress) {
        needSync = true;
        return;
    }

    syncInProgress = true;
    // read db, dbRemove and repo
    getItemsFromDB().then(([deletedWhileOffline, dbItems]) => {
        // delete in repo all from db-delete
        SyncHelper.removeItemsFromRepo(deletedWhileOffline).then(() => {
            // change in repo all marked with change and sync not synced items
            SyncHelper.syncOfflineChanges(dbItems).then(syncPromises => {
                if (
                    wentOnline &&
                    syncPromises.some(promise => !!promise)
                ) {
                    SyncHelper.showToastNotification(ToasterInstance);
                }

                // get new items from repo (synced values are changed if synced)
                SyncHelper.getItemsFromRepo().then(repoItems => {
                    // flush db & dbRemove
                    Promise.all([
                        storage.flush.offline(SyncHelper.storeNames.offline),
                        storage.flush.offline(SyncHelper.storeNames.deleted)
                    ]).then(() => {
                        // add all items from repo into db.
                        Promise.resolve(
                            repoItems
                                ? Promise.all(
                                      repoItems.map(element =>
                                          storage.add.offline(
                                              SyncHelper.storeNames.offline,
                                              element.item,
                                              true
                                          )
                                      )
                                  )
                                : null
                        ).then(() => {
                            wentOnline = false;
                            updateUI();
                            syncInProgress = false;
                            if (needSync) {
                                needSync = false;
                                sync();
                            }
                        });
                    });
                });
            });
        });
    });
};

export function isChangeDoneinRepo() {
    if (navigator.onLine) {
        SyncHelper.getItemsFromRepo().then(repo => {
            getItemsFromDB().then(values => {
                const offlineStorage = values[1].reverse();

                if (repo.length !== offlineStorage.length) {
                    syncronize();
                    return;
                }
                repo.forEach((item, i) => {
                    const offlineItem = offlineStorage[i];
                    if (JSON.stringify(item) !== JSON.stringify(offlineItem)) {
                        syncronize();
                    }
                });
            });
        });
    }
}

export function syncronize() {
    sync();
}
