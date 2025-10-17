import { getCookie } from "./auth";

export const sessionId = getCookie("sessionId");
export const roleId = getCookie("roleId");
export const fullName = getCookie("fullName");
