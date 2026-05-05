export function numberToWords(n: any): string {
    const num = Math.floor(Number(n));
    if (isNaN(num) || num === 0) return "ZERO QR ONLY";

    const ones = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"];
    const tens = ["", "", "TWENTY", "THIRTY", "FOURTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];   

    function convertTens(val: number): string {
        if (val < 20) return ones[val];
        const digit = val % 10;
        const ten = Math.floor(val / 10);
        if (digit === 0) return tens[ten];
        return tens[ten] + " " + ones[digit];
    }

    function convertHundreds(val: number): string {
        if (val > 99) {
            return ones[Math.floor(val / 100)] + " HUNDRED " + (val % 100 === 0 ? "" : "AND " + convertTens(val % 100));
        } else {
            return convertTens(val);
        }
    }

    let result = "";
    let tempN = num;

    if (tempN >= 1000000) {
        result += convertHundreds(Math.floor(tempN / 1000000)) + " MILLION ";
        tempN %= 1000000;
    }
    if (tempN >= 1000) {
        result += convertHundreds(Math.floor(tempN / 1000)) + " THOUSAND ";
        tempN %= 1000;
    }
    if (tempN > 0) {
        result += convertHundreds(tempN);
    }

    return result.trim().replace(/\s+/g, ' ') + " QR ONLY";
}
