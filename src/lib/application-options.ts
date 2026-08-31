/** Option lists for the application form's select fields. */

export interface Option {
    value: string
    label: string
}

const INCH = 2.54

/** 178 → 5′10″ */
function feetInches(cm: number): string {
    const total = Math.round(cm / INCH)
    return `${Math.floor(total / 12)}′${total % 12}″`
}

/** Height reads better in feet and inches than in inches alone. */
function heightRange(from: number, to: number): Option[] {
    return Array.from({ length: to - from + 1 }, (_, i) => {
        const cm = from + i
        return { value: String(cm), label: `${cm} cm · ${feetInches(cm)}` }
    })
}

/** Bust, waist and hips are quoted in plain inches. */
function cmRange(from: number, to: number): Option[] {
    return Array.from({ length: to - from + 1 }, (_, i) => {
        const cm = from + i
        return { value: String(cm), label: `${cm} cm · ${Math.round(cm / INCH)}″` }
    })
}

export const GENDERS = [
    "Female",
    "Male",
    "Non-binary",
    "Prefer to self-describe",
]

// Wide enough for every board — women's, men's, commercial. Bust, waist and
// hips stay generous at the low end because a very slim young applicant is
// exactly who gets scouted; height runs 150 cm to 2 m, low enough that a
// fourteen-year-old who is still growing can still apply.
export const HEIGHTS = heightRange(150, 200)
export const BUSTS = cmRange(65, 115)
export const WAISTS = cmRange(45, 105)
export const HIPS = cmRange(65, 120)

/**
 * EU only. Conversions to US and UK differ by brand, and a wrong size on a
 * casting sheet is worse than no conversion at all.
 */
export const SHOE_SIZES: Option[] = Array.from({ length: 15 }, (_, i) => {
    const eu = 34 + i
    return { value: String(eu), label: `${eu} EU` }
})

export const HAIR_COLORS = [
    "Black",
    "Dark brown",
    "Brown",
    "Light brown",
    "Blonde",
    "Dark blonde",
    "Platinum",
    "Red",
    "Auburn",
    "Grey",
    "Dyed / other",
]

export const EYE_COLORS = [
    "Brown",
    "Dark brown",
    "Hazel",
    "Green",
    "Blue",
    "Grey",
    "Amber",
    "Heterochromia",
]

export const COUNTRIES = [
    "Albania", "Argentina", "Armenia", "Australia", "Austria", "Belarus",
    "Belgium", "Bosnia and Herzegovina", "Brazil", "Bulgaria", "Canada",
    "Chile", "China", "Colombia", "Croatia", "Czechia", "Denmark", "Estonia",
    "Finland", "France", "Georgia", "Germany", "Greece", "Hungary", "Iceland",
    "India", "Indonesia", "Ireland", "Israel", "Italy", "Japan", "Kazakhstan",
    "Latvia", "Lithuania", "Luxembourg", "Malaysia", "Mexico", "Moldova",
    "Montenegro", "Morocco", "Netherlands", "New Zealand", "North Macedonia",
    "Norway", "Peru", "Philippines", "Poland", "Portugal", "Romania",
    "Russia", "Serbia", "Singapore", "Slovakia", "Slovenia", "South Africa",
    "South Korea", "Spain", "Sweden", "Switzerland", "Thailand", "Türkiye",
    "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
    "Uruguay", "Vietnam",
]
