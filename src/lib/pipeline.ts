export interface Stage {
    number: string
    name: string
    description: string
}

/** The six stages every applicant moves through. */
export const STAGES: Stage[] = [
    {
        number: "01",
        name: "Applied",
        description:
            "Applications land in one place — photos, measurements, and contact details already structured.",
    },
    {
        number: "02",
        name: "Pre-Select",
        description:
            "Scouts filter and shortlist. What doesn't fit is out before anyone spends a meeting on it.",
    },
    {
        number: "03",
        name: "Scheduled",
        description:
            "Hold a casting or book a meeting — invitations, confirmations, and who actually showed.",
    },
    {
        number: "04",
        name: "Final Voting",
        description:
            "The board reviews the shortlist together and votes. One record of who said what.",
    },
    {
        number: "05",
        name: "Onboarding",
        description:
            "Contracts, guardian consent, and measurements collected once, in order.",
    },
    {
        number: "06",
        name: "On the Board",
        description:
            "Talent is live on the agency's board — ready to submit to clients, or to export as a package.",
    },
]
