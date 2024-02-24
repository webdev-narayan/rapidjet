const codeAndName = {
    200: "OK!",
    201: "Created!",
    400: "Bad Request!",
    401: "Unauthorized!",
    403: "Forbidden!",
    404: "Not Found!",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
};
export function errorResponse({
    status = 400,
    name = codeAndName[status],
    message = "Invalid Data",
    details = "",
}) {
    return {
        error: {
            status: status,
            name: name,
            message: message,
            details: details,
        },
    };
}

