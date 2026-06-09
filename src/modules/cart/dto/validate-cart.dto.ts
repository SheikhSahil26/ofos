export interface CartValidationIssueDTO {
    menuItemId: string;
    issue: string;
}

export interface ValidateCartResponseDTO {
    valid: boolean;
    issues?: CartValidationIssueDTO[];
}