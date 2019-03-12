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

export const CITY_JSON_SCHEMA = {
    "title": "city",
    "description": "Schema for adding city",
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "country": {"type": "string"},
        "location": {
            "type": "object",
            "properties": {
                "lat": {"type": "number"},
                "lon": {"type": "number"}
            }
        }
    },
    "required": ["name", "country", "location"]
};