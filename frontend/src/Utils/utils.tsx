export const valideInput = (str: string, validChar: string) => {
    for (let i = 0; i < str.length; i++) {
        let a = false;
        for (let y = 0; y < validChar.length; y++) {
            // console.log(str[i], validChar[y]);
            if (str[i] == validChar[y]) {
                a = true;
                break;
            }
        }
        if (!a) {
            console.log("str[i]: ", str[i]);
            return false;
        }
    }
    return true;
}