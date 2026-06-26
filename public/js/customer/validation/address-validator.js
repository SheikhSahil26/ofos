function validateAddress(data) {

    const errors = {};

    if (!data.label?.trim()) {
        errors.label = "Address label is required";
    }

    if (!data.addressLine1?.trim()) {
        errors.addressLine1 = "Address Line 1 is required";
    }

    if (!data.city?.trim()) {
        errors.city = "City is required";
    }

    if (!data.state?.trim()) {
        errors.state = "State is required";
    }

    if (!data.pincode?.trim()) {
        errors.pincode = "Pincode is required";
    }
    else if (!/^\d{6}$/.test(data.pincode)) {
        errors.pincode = "Pincode must be 6 digits";
    }

    if (
        !data.latitude ||
        data.latitude.toString().trim() === ""
    ) {
        errors.latitude =
            "Latitude is required";
    } else if (
        isNaN(Number(data.latitude))
    ) {
        errors.latitude =
            "Latitude must be a number";
    }

    if (
        !data.longitude ||
        data.longitude.toString().trim() === ""
    ) {
        errors.longitude =
            "Longitude is required";
    } else if (
        isNaN(Number(data.longitude))
    ) {
        errors.longitude =
            "Longitude must be a number";
    }

    return errors;
};
