type qk = {
    backlog: string;
    userStories: string;
    users: string;
}

const QueryKeys: qk = {
    backlog: "db:backlog",
    userStories: "db:userStories",
    users: "db:users",
};

export default QueryKeys;