var repoLib = require('/lib/xp/repo');
var nodeLib = require('/lib/xp/node');
var util = require('/lib/util');

var REPO_NAME = 'push';
exports.REPO_NAME = REPO_NAME;

var PUSH_SUBSCRIPTIONS_PATH = '/subscriptions';
exports.PUSH_SUBSCRIPTIONS_PATH = PUSH_SUBSCRIPTIONS_PATH;

var ROOT_PERMISSIONS = [
    {
        "principal": "role:system.everyone",
        "allow": [
            "READ",
            "CREATE",
            "MODIFY",
            "DELETE",
            "PUBLISH",
            "READ_PERMISSIONS",
            "WRITE_PERMISSIONS"
        ],
        "deny": []
    }
];
exports.ROOT_PERMISSIONS = ROOT_PERMISSIONS;

exports.initialize = function () {
    log.info('Initializing repository...');

    util.sudo(doInitialize);

    log.info('Repository initialized.');
};

var doInitialize = function () {
    var result = repoLib.get(REPO_NAME);

    if (result) {
        log.info('Repository [' + REPO_NAME + '] exists. Nothing to create.');
    } else {
        log.info('Repository [' + REPO_NAME + ']  not found');
        createRepo();
    }
    createSubscriptionNode();
};

var createRepo = function () {
    log.info('Creating repository [' + REPO_NAME + ']...');
    repoLib.create({
        id: REPO_NAME,
        rootPermissions: ROOT_PERMISSIONS
    });
    log.info('Repository created.');
};

var createSubscriptionNode = function () {
    var repoConn = nodeLib.connect({
        repoId: REPO_NAME,
        branch: 'master'
    });

    var pushSubscriptionsExist = nodeWithPathExists(repoConn, PUSH_SUBSCRIPTIONS_PATH);

    if (pushSubscriptionsExist) {
        log.info('Node [' + PUSH_SUBSCRIPTIONS_PATH + '] exists. Nothing to create.');
        return;
    }

    log.info('Creating node [' + PUSH_SUBSCRIPTIONS_PATH + '] ...');
    repoConn.create({
        _name: PUSH_SUBSCRIPTIONS_PATH.slice(1),
        _parentPath: '/',
        _permissions: ROOT_PERMISSIONS
    });
};

var nodeWithPathExists = function (repoConnection, path) {
    var result = repoConnection.query({
        start: 0,
        count: 0,
        query: "_path = '" + path + "'"
    });
    return result.total > 0;
};


