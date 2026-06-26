function formatStatus(status) {

    return status
        .replaceAll("_", " ");
}

function getShortOrderNumber(orderNumber) {

    return orderNumber
        .split("-")
        .pop();
}

function formatDate(date) {

    return new Date(date)
        .toLocaleString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit"
            }
        );
}