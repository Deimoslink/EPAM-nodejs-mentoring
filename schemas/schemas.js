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

export const PRODUCT_JSON_SCHEMA = {
    "title": "product",
    "description": "Schema for adding product",
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "country": {"type": "string"},
        "description": {"type": "string"}
    },
    "required": ["name", "country", "description"]
};