import { v4 as uuid } from "uuid";

const userIdKey = "USER_ID";

const userId = window.localStorage.getItem(userIdKey) || uuid();

window.localStorage.setItem(userIdKey, userId);

export default userId;
