export default interface Item {
    itemID: string;
    name: string,
    description: string,
    tag: "epic" | "story" | "task" | "subtask" | "bug",
    status: "active" | "inactive",
    priority: string,
    size: string,
    author: string,
}