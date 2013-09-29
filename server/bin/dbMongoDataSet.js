/*!
 * dbMongo-node
 * Data sets for Mongo
 */

var account = {
    type:           0, // 0 =  merchant, 1 = server, 2 = consumer

    firstName:          "",
    lastName:           "",
    email:              "",
    phone:              "",
    establishment:      "",
    auth: { pass: "", salt: "", reset: [] },
    simplifyAccount: {
        name:           "",
        auth: {
            pass:           "",
            key:            ""
        }
    },

    session:        []
};

var order = {
    custAccount:    "", // customer id (from Accounts collection)
    merchAccount:   "",
    displayCode:    "",
    items:          [], // {menuID:0, description: ""}
    total:          0,
    status:         0, // 0 = received, 1 = started, 2 = cannot be filled, 3 = filled, 9 = problem
    time:           {received:0, started: 0, filled: 0} // { received:0, started:0, filled:0 }
}

 exports.account                   = account;
 exports.order                     = order;

