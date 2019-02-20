export const LOGIN_JSON_SCHEMA = {
    "title": "auth",
    "description": "Schema for user authorization",
    "type": "object",
    "properties": {
        "login": {"type": "string"},
        "password": {"type": "string"}
    },
    "required": ["login", "password"]
};