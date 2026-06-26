function validateModifierGroups() {

    for (
        const group of
        currentModifierGroups
    ) {

        const selected =
            document.querySelectorAll(
                `[name="group-${group.id}"]:checked`
            );

        console.log(
            group.name,
            "selected:",
            selected.length,
            "required:",
            group.isRequired
        );

        if (
            group.isRequired &&
            selected.length <
            group.minSelection
        ) {

            throw new Error(
                `${group.name} is required`
            );
        }

        if (
            selected.length >
            group.maxSelection
        ) {

            throw new Error(
                `Maximum ${group.maxSelection} options allowed for ${group.name}`
            );
        }
    }
}